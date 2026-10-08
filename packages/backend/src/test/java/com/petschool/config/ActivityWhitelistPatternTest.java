package com.petschool.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.server.PathContainer;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 免登录放行规则的模式匹配测试（纯单元测试，不启动 Spring）
 * <p>
 * WebMvcConfiguration 里给 JwtTokenInterceptor 配了
 * {@code excludePathPatterns("/activities")}，让首页未登录也能看到活动列表。
 * 这条放行**必须只命中列表本身**，绝不能顺带把
 * {@code /activities/{id}/signup}（写接口）也放出去——那等于匿名可写。
 * <p>
 * 这里直接用 Spring 自己的 PathPattern 引擎验证，而不是靠读文档或猜。
 * 同文件里 {@code /pets} 已放行、{@code /pets/pending/my} 仍受保护，是同一个先例。
 */
class ActivityWhitelistPatternTest {

    private final PathPatternParser parser = new PathPatternParser();

    private boolean matches(String pattern, String path) {
        PathPattern compiled = parser.parse(pattern);
        return compiled.matches(PathContainer.parsePath(path));
    }

    @Test
    @DisplayName("放行模式 /activities 命中列表本身")
    void activitiesPatternMatchesList() {
        assertTrue(matches("/activities", "/activities"));
    }

    @Test
    @DisplayName("放行模式 /activities 不命中报名写接口（否则匿名就能报名）")
    void activitiesPatternDoesNotMatchSignup() {
        assertFalse(matches("/activities", "/activities/1/signup"),
                "放行规则若命中写接口，未登录用户就能直接 POST 报名");
    }

    @Test
    @DisplayName("放行模式 /activities 不命中 /my-activities（它需要 userId）")
    void activitiesPatternDoesNotMatchMyActivities() {
        assertFalse(matches("/activities", "/my-activities"));
    }

    @Test
    @DisplayName("放行模式 /activities 也不会命中 /activities/1")
    void activitiesPatternDoesNotMatchDetailPath() {
        assertFalse(matches("/activities", "/activities/1"));
    }

    @Test
    @DisplayName("既有先例：/pets 放行，但 /pets/pending/my 仍需认证")
    void petsPrecedentStillHolds() {
        assertTrue(matches("/pets", "/pets"));
        assertFalse(matches("/pets", "/pets/pending/my"),
                "/pets/pending/my 靠 userId 工作，被放行就会拿到 null");
    }

    @Test
    @DisplayName("反例：/activities/** 会把报名写接口一并放出去，绝不能用")
    void doubleWildcardWouldLeakTheWriteEndpoint() {
        // 说明性断言——把危险写法的后果钉在测试里，免得日后有人为了"顺手"把它改宽。
        assertTrue(matches("/activities/**", "/activities/1/signup"),
                "这就是绝不能用 /activities/** 的原因：它连报名写接口一起放行，等于匿名可写");
        assertTrue(matches("/activities/**", "/activities"),
                "而且它同时也命中列表本身，看起来'什么都能匹配'，很容易被误认为更省事");
    }

    @Test
    @DisplayName("反例：/activities/* 不是安全写法，它是坏的——列表本身都放不出去")
    void singleWildcardIsBrokenRatherThanDangerous() {
        // 单星号只吃**一段**。它的失败方式与直觉相反：不是"放太宽"，
        // 而是既放不出列表（少一段）、也放不出写接口（多一段），功能直接坏掉。
        //
        // 这条值得钉住，是因为它和 WebMvcConfiguration 里
        // 「不要用 /pets/*，因为 /pets/pending 会被错误地排除」那句注释是同一个机制：
        // 单星号能吃掉的正是 /pets/pending 这样的一段路径。
        assertFalse(matches("/activities/*", "/activities"),
                "少一段，连不上：放行规则写错成这个，首页活动列表会 401");
        assertTrue(matches("/activities/*", "/activities/1"),
                "它恰好能匹配的是详情路径（本项目暂无 /activities/{id} 页面）");
        assertFalse(matches("/activities/*", "/activities/1/signup"),
                "多一段，够不着：所以它挡住写接口靠的是'不够宽'的巧合，不是设计意图");
    }
}
