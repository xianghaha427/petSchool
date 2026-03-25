package com.petschool;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * PetSchool 后端应用启动类
 */
@SpringBootApplication
@MapperScan("com.petschool.mapper")
public class PetSchoolApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetSchoolApplication.class, args);
        System.out.println("✅ PetSchool Backend 启动成功！");
    }
}
