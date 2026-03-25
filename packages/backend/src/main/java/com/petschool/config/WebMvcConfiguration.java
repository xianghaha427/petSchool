package com.petschool.config;

import com.petschool.interceptor.JwtTokenInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

@Configuration
@Slf4j
public class WebMvcConfiguration extends WebMvcConfigurationSupport {
    //配置拦截器
    @Autowired
    JwtTokenInterceptor jwtTokenInterceptor;

    protected void addInterceptors(InterceptorRegistry registry){
        log.info("配置拦截器");
        registry.addInterceptor(jwtTokenInterceptor)
                .addPathPatterns("/**")//拦截所有请求
                .excludePathPatterns("/users/login")
                .excludePathPatterns("/users/register")
                .excludePathPatterns("/carousel");//放行登录请求,因为jwt是通过登录请求生成返回的
    }
}
