package com.petschool.utils;

import com.petschool.mapper.PetMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 学号生成工具类
 * 学号格式：P + yyyyMMdd + 序号（共12位）
 * 例如：P20260406001（2026年4月6日第1条）
 */
@Slf4j
@Component
public class StudentIdGenerator {

    private static final String PREFIX = "P";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Autowired
    private PetMapper petMapper;

    /**
     * 生成下一个学号
     * 格式：P + yyyyMMdd + 序号（共12位）
     *
     * @return 生成的学号
     */
    public synchronized String generateStudentId() {
        String today = LocalDate.now().format(DATE_FORMATTER);
        String todayPrefix = PREFIX + today;

        // 查询当日最大序号
        Integer maxSeq = getMaxSequenceForToday(todayPrefix);

        // 序号从 001 开始
        int nextSeq = (maxSeq == null) ? 1 : maxSeq + 1;

        // 格式化序号为3位
        String studentId = todayPrefix + String.format("%03d", nextSeq);
        log.info("生成学号：{}", studentId);

        return studentId;
    }

    /**
     * 获取当日最大序号
     *
     * @param todayPrefix 当日学号前缀（不含序号）
     * @return 当日最大序号，如果没有则返回 null
     */
    private Integer getMaxSequenceForToday(String todayPrefix) {
        try {
            // 查询所有以今日前缀开头的学号
            var studentIds = petMapper.selectAllStudentIds();

            Integer maxSeq = null;
            for (String studentId : studentIds) {
                if (studentId != null && studentId.startsWith(todayPrefix)) {
                    // 提取序号部分（最后3位）
                    String seqStr = studentId.substring(studentId.length() - 3);
                    try {
                        int seq = Integer.parseInt(seqStr);
                        if (maxSeq == null || seq > maxSeq) {
                            maxSeq = seq;
                        }
                    } catch (NumberFormatException e) {
                        // 忽略无效序号
                    }
                }
            }

            return maxSeq;
        } catch (Exception e) {
            log.error("获取当日最大序号失败", e);
            return null;
        }
    }
}
