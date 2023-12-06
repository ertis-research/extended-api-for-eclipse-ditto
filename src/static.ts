export const mongodb_uri = process.env.MONGO_URI_POLICIES

export const getAllpolicies_enabled = mongodb_uri !== undefined
    && mongodb_uri !== ""
    && (mongodb_uri.startsWith("mongodb://") || mongodb_uri.startsWith("mongodb+srv://"))