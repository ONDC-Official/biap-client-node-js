const ON_CONFIRM = "protocol/response/v1/on_confirm";
const ON_CANCEL = "protocol/response/v1/on_cancel";
const ON_INIT = "protocol/response/v1/on_init";
const ON_SEARCH = "protocol/response/v1/on_search";
const ON_SELECT = "protocol/response/v1/on_select";
const ON_STATUS = "protocol/response/v1/on_status";
const ON_SUPPORT = "protocol/response/v1/on_support";
const ON_TRACK = "protocol/response/v1/on_track";
const ON_UPDATE = "protocol/response/v1/on_update";

const CONFIRM = "protocol/confirm";
const DUMP = "protocol/request-dump";
const CANCEL = "protocol/cancel";
const INIT = "protocol/init";
const SEARCH = "protocol/search";
const SELECT = "protocol/select";
const STATUS = "protocol/status";
const SUPPORT = "protocol/support";
const TRACK = "protocol/track";
const UPDATE = "protocol/update";
const SEARCH_ITEM = "protocol/items";
const SEARCH_ITEM_DETAILS = "protocol/ils";
const RESPONSE = "protocol/response";

const SEARCH_ATTRIBUTE = "protocol/attributes";
const SEARCH_ATTRIBUTE_VALUE = "protocol/attribute-values";
const PROVIDERS = "protocol/providers";
const CUSTOM_MENU = "protocol/custom-menus";
const LOCATIONS = "protocol/locations";
const LOCATIONS_DETAILS = "protocol/location-details";
const PROVIDER_DETAILS = "protocol/provider-details";
// const ON_UPDATE = "protocol/on_update";

const PROTOCOL_API_URLS = {
    LOCATIONS_DETAILS,
    CONFIRM,
    CANCEL,
    INIT,
    ON_CANCEL,
    ON_CONFIRM,
    ON_INIT,
    ON_SEARCH,
    ON_SELECT,
    ON_STATUS,
    ON_SUPPORT,
    ON_TRACK,
    SEARCH,
    SEARCH_ITEM,
    SELECT,
    STATUS,
    SUPPORT,
    TRACK,
    UPDATE,
    ON_UPDATE,
    SEARCH_ATTRIBUTE,
    SEARCH_ATTRIBUTE_VALUE,
    PROVIDERS,
    PROVIDER_DETAILS,
    LOCATIONS,
    CUSTOM_MENU,
    RESPONSE,
    DUMP,
    SEARCH_ITEM_DETAILS
};

export default PROTOCOL_API_URLS;