package com.petschool.utils;

import com.petschool.mapper.PetMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 学号生成工具类
 * 学号格式：P + yyyy + 序号（共9位）
 * 例如：P20260001（2026年第1条）
 */
@Slf4j
@Component
public class StudentIdGenerator {

    /** 正式学号形状：P + 4位年份 + 4位序号，与库中存量学号（如 P20240001）保持一致 */
    private static final Pattern STUDENT_ID_PATTERN = Pattern.compile("^P(\\d{4})(\\d{4})$");

    @Autowired
    private PetMapper petMapper;

    /**
     * 生成下一个学号
     * 格式：P + yyyy + 序号（共9位）
     *
     * @return 生成的学号
     */
    public synchronized String generateStudentId() {
        String year = String.valueOf(LocalDate.now().getYear());

        // 查询当年最大序号
        Integer maxSeq = getMaxSequenceOfYear(year);

        // 序号从 0001 开始
        int nextSeq = (maxSeq == null) ? 1 : maxSeq + 1;

        String studentId = "P" + year + String.format("%04d", nextSeq);
        log.info("生成学号：{}", studentId);

        return studentId;
    }

    /**
     * 获取指定年份的最大序号
     * 只统计符合「P + 4位年份 + 4位序号」形状的学号，避免把其他格式的历史数据误当序号
     *
     * @param year 4位年份
     * @return 该年份最大序号，如果没有则返回 null
     */
    private Integer getMaxSequenceOfYear(String year) {
        try {
            List<String> studentIds = petMapper.selectAllStudentIds();
            if (studentIds == null || studentIds.isEmpty()) {
                return null;
            }

            Integer maxSeq = null;
            for (String studentId : studentIds) {
                if (studentId == null) {
                    continue;
                }
                Matcher matcher = STUDENT_ID_PATTERN.matcher(studentId.trim());
                if (!matcher.matches() || !year.equals(matcher.group(1))) {
                    continue;
                }
                int seq = Integer.parseInt(matcher.group(2));
                if (maxSeq == null || seq > maxSeq) {
                    maxSeq = seq;
                }
            }

            return maxSeq;
        } catch (Exception e) {
            log.error("获取{}年最大序号失败", year, e);
            return null;
        }
    }
}
