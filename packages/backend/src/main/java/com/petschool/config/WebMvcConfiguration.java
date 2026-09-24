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
                .excludePathPatterns("/pets");//放行宠物列表查询
                // 注意：不要用 /pets/* 来排除，因为 /pets/pending 会被错误地排除
                // /pets/pending/my 需要认证来获取 userId，不能排除
    }

    /**
     * 上传文件的静态资源映射。
     * <p>
     * 本类继承自 WebMvcConfigurationSupport，Spring Boot 的 WebMvcAutoConfiguration
     * 与 WebMvcConfigurer 收集机制都已失效，因此必须在这里直接重写。
     * <p>
     * location 必须使用 Path.toUri().toString()（Windows 下才能得到合法的
     * file:///D:/... 形式且以 / 结尾），手拼 "file:" + dir 会 404 且不报错。
     */
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadProperties.resolveRoot().toUri().toString();
        log.info("配置上传目录静态资源映射: /uploads/** -> {}", location);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);
    }
}
