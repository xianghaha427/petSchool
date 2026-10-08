package com.petschool.controller;

import com.petschool.dto.ActivityCreateDTO;
import com.petschool.dto.ActivitySignupDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 创建活动接口的参数校验测试（纯单元测试，不启动 Spring）
 * <p>
 * 存在的理由：本项目既有的写接口（{@code AdminController.createPet}、
 * {@code MyPetController.updateMyPet}、{@code PetPendingController.submitPending}）
 * **全都没有写 {@code @Valid}**，于是 DTO 上那一堆 {@code @NotBlank}/{@code @Size}
 * 从来没生效过。光测 DTO 上的注解还在，证明不了接口真的会触发校验——所以这里
 * 额外用反射断言 {@code @Valid} 确实挂在方法参数上。两件事一起才构成完整证据链。
 */
class AdminActivityControllerValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        if (factory != null) {
            factory.close();
        }
    }

    private static Set<String> violatedFields(Object bean) {
        return validator.validate(bean).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    // ------------------------------------------------------------------
    // @Valid 是否真的挂在接口上
    // ------------------------------------------------------------------

    @Test
    @DisplayName("AdminActivityController.createActivity 的参数上有 @Valid")
    void createActivity_shouldDeclareValid() throws Exception {
        Method method = AdminActivityController.class.getMethod(
                "createActivity", HttpServletRequest.class, ActivityCreateDTO.class);

        assertTrue(hasValidAnnotation(method, 1),
                "创建活动的 DTO 参数必须带 @Valid，否则 ActivityCreateDTO 上的校验注解全是摆设");
    }

    @Test
    @DisplayName("ActivityController 的报名/取消接口参数上有 @Valid")
    void signup_shouldDeclareValid() throws Exception {
        Method method = ActivityController.class.getMethod(
                "signup", HttpServletRequest.class, Long.class, ActivitySignupDTO.class);

        assertTrue(hasValidAnnotation(method, 2),
                "报名 DTO 参数必须带 @Valid");
    }

    /** 第 index 个参数上是否带 @Valid */
    private static boolean hasValidAnnotation(Method method, int index) {
        Annotation[][] annotations = method.getParameterAnnotations();
        for (Annotation annotation : annotations[index]) {
            if (annotation instanceof Valid) {
                return true;
            }
        }
        return false;
    }

    // ------------------------------------------------------------------
    // DTO 上的约束本身
    // ------------------------------------------------------------------

    private static ActivityCreateDTO validDTO() {
        ActivityCreateDTO dto = new ActivityCreateDTO();
        dto.setTitle("春季运动会");
        dto.setLocation("中央草坪");
        dto.setStartAt(LocalDateTime.of(2026, 3, 15, 14, 0, 0));
        dto.setEndAt(LocalDateTime.of(2026, 3, 15, 17, 0, 0));
        return dto;
    }

    @Test
    @DisplayName("合法的创建请求：零违规")
    void validCreateRequest_shouldPass() {
        assertTrue(violatedFields(validDTO()).isEmpty(),
                "合法请求不应触发任何校验：" + violatedFields(validDTO()));
    }

    @Test
    @DisplayName("标题为空 / 地点为空 / 时间为空：逐个被拦下")
    void createRequest_shouldRejectBlanks() {
        ActivityCreateDTO blankTitle = validDTO();
        blankTitle.setTitle("   ");
        assertTrue(violatedFields(blankTitle).contains("title"));

        ActivityCreateDTO blankLocation = validDTO();
        blankLocation.setLocation("");
        assertTrue(violatedFields(blankLocation).contains("location"));

        ActivityCreateDTO noStart = validDTO();
        noStart.setStartAt(null);
        assertTrue(violatedFields(noStart).contains("startAt"));

        ActivityCreateDTO noEnd = validDTO();
        noEnd.setEndAt(null);
        assertTrue(violatedFields(noEnd).contains("endAt"));
    }

    @Test
    @DisplayName("超长字段被拦下，且不越过数据库列宽")
    void createRequest_shouldRejectOverlongFields() {
        ActivityCreateDTO dto = validDTO();
        // activity.title 是 VARCHAR(128)
        dto.setTitle("长".repeat(129));
        assertTrue(violatedFields(dto).contains("title"));

        ActivityCreateDTO ok = validDTO();
        ok.setTitle("长".repeat(128));
        assertTrue(violatedFields(ok).isEmpty(), "正好 128 字符应该通过");
    }

    @Test
    @DisplayName("非法配色主题被拦下；漏传主题则放行（回落默认值由 service 负责）")
    void createRequest_shouldValidateTheme() {
        ActivityCreateDTO illegal = validDTO();
        illegal.setTheme("rainbow");
        assertTrue(violatedFields(illegal).contains("theme"));

        // @Pattern 对 null 放行，这是刻意的：配色是装饰性的，
        // 不该因为一个颜色让用户拿不到 400
        ActivityCreateDTO noTheme = validDTO();
        noTheme.setTheme(null);
        assertEquals(0, violatedFields(noTheme).size(),
                "主题漏传不应报错，service 会回落到默认主题");
    }

    @Test
    @DisplayName("报名请求：宠物名/主人名/手机号为空被拦下；空邮箱放行")
    void signupRequest_shouldValidate() {
        ActivitySignupDTO dto = new ActivitySignupDTO();
        dto.setPetName("");
        dto.setOwnerName("");
        dto.setPhone("");
        Set<String> fields = violatedFields(dto);
        assertTrue(fields.contains("petName"));
        assertTrue(fields.contains("ownerName"));
        assertTrue(fields.contains("phone"));

        ActivitySignupDTO ok = new ActivitySignupDTO();
        ok.setPetName("旺财");
        ok.setOwnerName("张三");
        ok.setPhone("13800138000");
        ok.setEmail("");   // 表单默认值就是空串，@Email 对空串放行
        assertTrue(violatedFields(ok).isEmpty(),
                "空串邮箱不该报错：" + violatedFields(ok));

        ActivitySignupDTO badEmail = new ActivitySignupDTO();
        badEmail.setPetName("旺财");
        badEmail.setOwnerName("张三");
        badEmail.setPhone("13800138000");
        badEmail.setEmail("not-an-email");
        assertTrue(violatedFields(badEmail).contains("email"));
    }
}
