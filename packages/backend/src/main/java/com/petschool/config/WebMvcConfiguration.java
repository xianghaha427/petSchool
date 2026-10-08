package com.petschool.config;

import com.petschool.config.properties.UploadProperties;
import com.petschool.interceptor.JwtTokenInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

@Configuration
@Slf4j
public class WebMvcConfiguration extends WebMvcConfigurationSupport {
    //配置拦截器
    @Autowired
    JwtTokenInterceptor jwtTokenInterceptor;

    @Autowired
    UploadProperties uploadProperties;

    protected void addInterceptors(InterceptorRegistry registry){
        log.info("配置拦截器");
        registry.addInterceptor(jwtTokenInterceptor)
                .addPathPatterns("/**")//拦截所有请求
                .excludePathPatterns("/users/login")
                .excludePathPatterns("/users/register")
                .excludePathPatterns("/carousel")
                .excludePathPatterns("/pets")//放行宠物列表查询
                .excludePathPatterns("/activities");//放行活动列表，供首页未登录浏览
                // 注意：不要用 /pets/* 来排除，因为 /pets/pending 会被错误地排除
                // /pets/pending/my 需要认证来获取 userId，不能排除
                //
                // 同理，这里只放行 /activities 这一个精确路径：报名写接口在
                // /activities/{id}/signup 上，不受此行影响，仍然需要 token。
                // excludePathPatterns 是精确匹配（不是前缀匹配），/pets 已放行而
                // /pets/pending/my 仍受保护就是同一个先例。
    }

    /**
     * 上传文件的静态资源映射。
     * <p>
     * 本类继承自 WebMvcConfigurationSupport，Spring Boot 的 WebMvcAutoConfiguration
     * 与 WebMvcConfigurer 收集机制都已失效，因此必须在这里直接重写。
     * <p>
     * location 必须使用 Path.toUri().toString()（Windows 下才能得到合法的
     * file:///D:/... 形式且以 / 结尾），手拼 "file:" + dir 会 404 且不报错。
     * <p>
     * 注意：context-path 是 /api，所以对外实际是 /api/uploads/**。
     */
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadProperties.resolveRoot().toUri().toString();
        // Path.toUri() 只在「调用这一刻目录已存在」时才会补上结尾的 /（JDK 内部用
        // WindowsFileAttributes.isDirectory 判断，路径不存在就静默不加）。而目录是
        // LocalFileStorageService 的 @PostConstruct 建的，与这里的 bean 创建时序无关，
        // 一旦缺了结尾斜杠，createRelative 会把文件名拼到上级目录，导致取图全部 404
        // 且不报任何错。这里显式补齐，不依赖时序。
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        log.info("配置上传目录静态资源映射: /uploads/** -> {}", location);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);
    }
}
