export const SYSTEM_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
};

export const EMAIL_TEMPLATES = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    SIGN_UP: 'SIGN_UP',
    REGISTER: 'REGISTER',
    RESEND_OTP: 'RESEND_OTP',
    WELCOME: 'WELCOME',
    RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
    INVITE: 'INVITE',
    USER_ACTIVITY: 'USER_ACTIVITY',
    EXCEPTION: 'EXCEPTION',
    EVENT_UPDATE: 'EVENT_UPDATE',
    EVENT_CANCEL: 'EVENT_CANCEL',
    ORDER_BOOKED: 'ORDER_BOOKED',
    ORDER_CANCEL: 'ORDER_CANCEL'
};

export const RESOURCE_POSSESSION = {
    OWN: 'OWN',
    ANY: 'ANY',
    SUB: 'SUB'
};

export const HEADERS = {
    ACCESS_TOKEN: 'access-token',
    AUTH_TOKEN: 'Authorization',
};

export const PAYMENT_TYPES = {
    "ON-ORDER": "ON-ORDER",
    "PRE-FULFILLMENT": "PRE-FULFILLMENT",
    "ON-FULFILLMENT": "ON-FULFILLMENT",
    "POST-FULFILLMENT": "POST-FULFILLMENT"
};

export const PROTOCOL_CONTEXT = {
    CANCEL: "cancel",
    ON_CANCEL: "on_cancel",
    CONFIRM: "confirm",
    ON_CONFIRM: "on_confirm",
    INIT: "init",
    ON_INIT: "on_init",
    SEARCH: "search",
    ON_SEARCH: "on_search",
    TRACK: "track",
    ON_TRACK: "on_track",
    SUPPORT: "support",
    ON_SUPPORT: "on_support",
    STATUS: "status",
    ON_STATUS: "on_status",
    SELECT: "select",
    ON_SELECT: "on_select",
    UPDATE: "update",
    ON_UPDATE: "on_update",
};

export const PROTOCOL_PAYMENT = {
    PAID: "PAID",
    "NOT-PAID": "NOT-PAID",
};

export const PROTOCOL_VERSION = {
    v_0_9_1: "0.9.1",
    v_0_9_3: "0.9.3",
    v_1_0_0: "1.0.0",
    v_1_2_0: "1.2.0"
};

export const SUBSCRIBER_TYPE = {
    BAP: "BAP",
    BPP: "BPP",
    BG: "BG",
    LREG: "LREG",
    CREG: "CREG",
    RREG: "RREG"
};

export const JUSPAY_PAYMENT_STATUS = {
    NEW: { id: 10, status: "NEW" },
    PENDING_VBV: { id: 23, status: "PENDING_VBV" },
    VBV_SUCCESSFUL: { id: 24, status: "VBV_SUCCESSFUL" },
    CHARGED: { id: 21, status: "CHARGED" },
    AUTHENTICATION_FAILED: { id: 26, status: "AUTHENTICATION_FAILED" },
    AUTHORIZATION_FAILED: { id: 27, status: "AUTHORIZATION_FAILED" },
    JUSPAY_DECLINED: { id: 22, status: "JUSPAY_DECLINED" },
    AUTHORIZING: { id: 28, status: "AUTHORIZING" },
    COD_INITIATED: { id: 29, status: "COD_INITIATED" },
    STARTED: { id: 20, status: "STARTED" },
    AUTO_REFUNDED: { id: 36, status: "AUTO_REFUNDED" },
    CAPTURE_INITIATED: { id: 33, status: "CAPTURE_INITIATED" },
    CAPTURE_FAILED: { id: 34, status: "CAPTURE_FAILED" },
    VOID_INITIATED: { id: 32, status: "VOID_INITIATED" },
    VOIDED: { id: 31, status: "VOIDED" },
    VOID_FAILED: { id: 35, status: "VOID_FAILED" },
    NOT_FOUND: { id: 40, status: "NOT_FOUND" }
}

export const ORDER_STATUS = {
    COMPLETED: "completed",
    "IN-PROGRESS": "in-progress"
}

export const PAYMENT_COLLECTED_BY = {
    BAP: "BAP",
    BPP: "BPP"
}

export const RAZORPAY_STATUS = {
    IN_PROGRESS: 'PENDING',
    COMPLETED: 'TXN_SUCCESS',
    FAILED: 'TXN_FAILURE',
    REVERSED: 'TXN_REVERSED',
};

export const CHANGE_TYPES = {
    TRANSACTION: 'TRANSACTION',
    STATUS_UPDATE: 'STATUS_UPDATE',
    INTENT_UPDATE: 'INTENT_UPDATE',
};

export const OBJECT_TYPE = {
    ITEM: 'ITEM',
    PROVIDER: 'PROVIDER',
    LOCATIONS: 'LOCATIONS',
    PROVIDER_DETAILS: 'PROVIDER_DETAILS',
    LOCATION_DETAILS: 'LOCATION_DETAILS',
    ITEM_DETAILS:'ITEM_DETAILS',
    CUSTOMMENU_ITEMS: 'CUSTOMMENU_ITEMS'
};
