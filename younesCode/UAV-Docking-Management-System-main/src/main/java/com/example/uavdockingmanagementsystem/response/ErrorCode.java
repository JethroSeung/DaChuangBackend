package com.example.uavdockingmanagementsystem.response;


import lombok.Getter;

/**
 * 自定义错误码
 */

@Getter
public enum ErrorCode {

    SUCCESS(0, "ok"),
    PARAMS_ERROR(40000, "请求参数错误"),
    NOT_LOGIN_ERROR(40100, "未登录"),
    NO_AUTH_ERROR(40101, "无权限"),
    NOT_EXIST_USER_ERROR(40102, "用户不存在"),
    NOT_FOUND_ERROR(40400, "请求数据不存在"),
    FORBIDDEN_ERROR(40300, "禁止访问"),
    SYSTEM_ERROR(50000, "系统内部异常"),
    OPERATION_ERROR(50001, "操作失败"),
    FILE_UPLOAD_ERROR(50002, "文件上传失败"),
    FILE_DELETE_ERROR(50003, "文件删除失败"),
    DATA_INTEGRITY_ERROR(50004, "数据完整性错误"),
    DATABASE_ERROR(50005, "数据库操作异常"),
    NETWORK_ERROR(50006, "网络连接异常"),
    TIMEOUT_ERROR(50007, "操作超时"),
    DUPLICATE_DATA_ERROR(40001, "数据重复"),
    INVALID_PASSWORD_ERROR(40103, "密码错误"),
    EXPIRED_TOKEN_ERROR(40104, "令牌已过期"),
    INVALID_TOKEN_ERROR(40105, "无效的令牌"),
    VERIFICATION_CODE_ERROR(40002, "验证码错误"),
    ACCOUNT_LOCKED_ERROR(40106, "账号已锁定"),
    PAYMENT_ERROR(50008, "支付异常"),
    SMS_SEND_ERROR(50009, "短信发送失败"),
    EMAIL_SEND_ERROR(50010, "邮件发送失败"),
    FILE_EMPTY(40003, "上传的文件为空"),
    FILE_TYPE_ERROR(40004, "文件类型不支持"),
    FILE_NAME_EMPTY(40005, "文件名不能为空"),
    FILE_NOT_FOUND(40401, "文件未找到"),
    FILE_SIZE_EXCEEDED(40006, "文件大小超过限制"),
    INVALID_INPUT(40007, "无效输入"),
    CONFLICT_ERROR(40900, "数据冲突"),
    UNPROCESSABLE_ENTITY(42200, "无法处理的实体"),
    RATE_LIMIT_EXCEEDED(42900, "请求频率超过限制"),
    SERVICE_UNAVAILABLE(50300, "服务不可用"),
    INTERNAL_SERVICE_ERROR(50001, "内部服务错误"),
    CONFIGURATION_ERROR(50002, "配置错误"),
    CACHE_ERROR(50003, "缓存操作错误"),
    SOCKET_ERROR(50004, "套接字错误"),
    PARSE_ERROR(40008, "数据解析错误"),
    ENCRYPTION_ERROR(50005, "加密错误"),
    DECRYPTION_ERROR(50006, "解密错误"),
    JSON_ERROR(40009, "JSON 数据错误"),
    XML_ERROR(40010, "XML 数据错误"),
    FILE_ACCESS_ERROR(40011,"前端静态错误"),
    NOTICE_TYPE_ERROR(40020, "通知类型错误"),
    NOTICE_NULL_ERROR(40021, "通知空内容"),
    NOTICE_DTO_ERROR(40022, "通知DTO错误");

    private final int code;

    /**
     * 信息
     */
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}
