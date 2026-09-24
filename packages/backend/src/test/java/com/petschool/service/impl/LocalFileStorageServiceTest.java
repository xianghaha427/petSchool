package com.petschool.service.impl;

import com.petschool.common.ResultCode;
import com.petschool.common.exception.BusinessException;
import com.petschool.config.properties.UploadProperties;
import com.petschool.vo.FileUploadVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 本地文件存储的纯单元测试，全部落在 @TempDir 里
 */
class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService service;

    @BeforeEach
    void setUp() {
        service = newService(tempDir, 4194304L);
    }

    private LocalFileStorageService newService(Path dir, long maxBytes) {
        UploadProperties properties = new UploadProperties();
        properties.setDir(dir.toString());
        properties.setUrlPrefix("/api/uploads");
        properties.setMaxBytes(maxBytes);
        return new LocalFileStorageService(properties);
    }

    @Test
    @DisplayName("正常图片落盘并返回可访问 url")
    void store_shouldSaveImage() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "我的猫.png", "image/png",
                "png-bytes".getBytes(StandardCharsets.UTF_8));

        FileUploadVO vo = service.store(file);

        assertTrue(vo.getUrl().startsWith("/api/uploads/"));
        assertTrue(vo.getFilename().endsWith(".png"));
        // 原始文件名一律不参与路径拼装
        assertFalse(vo.getFilename().contains("我的猫"));
        assertEquals(Long.valueOf(file.getSize()), vo.getSize());

        Path stored = tempDir.resolve(vo.getFilename());
        assertTrue(Files.exists(stored));
        assertArrayEquals("png-bytes".getBytes(StandardCharsets.UTF_8), Files.readAllBytes(stored));
    }

    @Test
    @DisplayName("拒绝白名单之外的扩展名")
    void store_shouldRejectNonWhitelistedExtension() {
        MockMultipartFile file = new MockMultipartFile("file", "evil.exe", "image/png",
                "MZ".getBytes(StandardCharsets.UTF_8));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.store(file));
        assertEquals(ResultCode.BAD_REQUEST.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("没有扩展名时被拒绝")
    void store_shouldRejectFilenameWithoutExtension() {
        MockMultipartFile file = new MockMultipartFile("file", "noext", "image/png",
                "data".getBytes(StandardCharsets.UTF_8));

        assertThrows(BusinessException.class, () -> service.store(file));
    }

    @Test
    @DisplayName("路径穿越的文件名不会逃逸出上传目录")
    void store_shouldNotEscapeRootDirectory() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "../../x.jpg", "image/jpeg",
                "data".getBytes(StandardCharsets.UTF_8));

        FileUploadVO vo = service.store(file);

        // 文件名完全自生成，不含任何路径分隔符
        assertFalse(vo.getFilename().contains("/"));
        assertFalse(vo.getFilename().contains("\\"));
        assertFalse(vo.getFilename().contains(".."));

        Path stored = tempDir.resolve(vo.getFilename()).normalize();
        assertTrue(stored.startsWith(tempDir.toAbsolutePath().normalize()));

        // 上传目录里有且只有一个文件，目录之外没有多出 x.jpg
        try (Stream<Path> files = Files.list(tempDir)) {
            assertEquals(1L, files.count());
        }
        assertFalse(Files.exists(tempDir.getParent().resolve("x.jpg")));
    }

    @Test
    @DisplayName("空文件被拒绝")
    void store_shouldRejectEmptyFile() {
        MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[0]);

        BusinessException ex = assertThrows(BusinessException.class, () -> service.store(file));
        assertEquals(ResultCode.BAD_REQUEST.getCode(), ex.getCode());
    }

    @Test
    @DisplayName("null 文件被拒绝")
    void store_shouldRejectNullFile() {
        assertThrows(BusinessException.class, () -> service.store(null));
    }

    @Test
    @DisplayName("超过大小上限的文件被拒绝")
    void store_shouldRejectOversizeFile() {
        LocalFileStorageService small = newService(tempDir, 8L);
        MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg",
                "0123456789".getBytes(StandardCharsets.UTF_8));

        assertThrows(BusinessException.class, () -> small.store(file));
    }

    @Test
    @DisplayName("非图片 content-type 被拒绝")
    void store_shouldRejectNonImageContentType() {
        MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "text/plain",
                "data".getBytes(StandardCharsets.UTF_8));

        assertThrows(BusinessException.class, () -> service.store(file));
    }

    @Test
    @DisplayName("resolveRoot 返回绝对规范化路径")
    void resolveRoot_shouldBeAbsoluteAndNormalized() {
        Path root = service.resolveRoot();

        assertTrue(root.isAbsolute());
        assertEquals(root, root.normalize());
        assertFalse(root.toString().contains(".."));
        assertEquals(tempDir.toAbsolutePath().normalize(), root);
    }

    @Test
    @DisplayName("initDirectory 能递归创建目录")
    void initDirectory_shouldCreateNestedDirectory() {
        Path nested = tempDir.resolve("a").resolve("b").resolve("c");
        LocalFileStorageService nestedService = newService(nested, 1024L);

        nestedService.initDirectory();

        assertTrue(Files.isDirectory(nested));
    }

    @Test
    @DisplayName("目录无法创建时只告警，绝不抛异常")
    void initDirectory_shouldNotThrowWhenDirectoryUnusable() throws IOException {
        // 拿一个普通文件当"父目录"，制造必定失败的路径
        Path notADirectory = tempDir.resolve("not-a-dir");
        Files.writeString(notADirectory, "x");
        LocalFileStorageService broken = newService(notADirectory.resolve("sub"), 1024L);

        assertDoesNotThrow(broken::initDirectory);
    }
}
