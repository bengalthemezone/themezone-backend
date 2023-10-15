const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    category: {
        type: String,
        required: true,
    },
    /*
    subCategory : {
        type : String,
        required : true,
    },
    */
    title: {
        type: String,
        required: true
    },
    caption: {
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    liveDemo: {
        type: String,
    },
    templateFiles: {
        type: String
    },
    coverPicture: {
        type: String
    },
    features: {
        type: String
    },
    additionalFeatures: {
        type: String
    },
    tech: {
        type: [String]
    },
    functionalities: {
        type: String
    },
    support: {
        type: String
    },
    compatibility: {
        type: String
    },
    version: {
        type: String
    },
    wordpressVersion: {
        type: String
    },
    woocommerceVersion: {
        type: String
    },
    builder: {
        type: String
    },
    price: {
        type: String,
        required: true
    },
    services: {
        installation: {
            type: Boolean,
            default: false
        },
        installationPrice: {
            type: Number
        },
        installationDeadline: {
            type: String
        },
        coversion: {
            type: Boolean,
            default: false
        },
        conversionPrice: {
            type: Number
        },
        conversionDeadline: {
            type: String
        },
        customization: {
            type: Boolean,
            default: false
        },
        customizationPrice: {
            type: Number
        },
        customizationDeadline: {
            type: String
        },
        seo: {
            type: Boolean,
            default: false
        },
        seoPrice: {
            type: Number
        },
        seoDeadline: {
            type: String
        },
        emailMarketing: {
            type: Boolean,
            default: false
        },
        emailMarketingPrice: {
            type: Number
        },
        emailMarketingDeadline: {
            type: String
        },
        logo: {
            type: Boolean,
            default: false,
        },
        logoPrice: {
            type: Number
        },
        logoDeadline: {
            type: String
        },
        contentAdd: {
            type: Boolean,
            default: false
        },
        contentAddPrice: {
            type: Number
        },
        contentAddDeadline: {
            type: String
        }
    },
    rating: {
        type: String,
        default: "0"
    },
    terms: {
        type: String
    },
    saleAvailable: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    activate: {
        type: Boolean,
        default: false
    }
})


module.exports = Template = mongoose.model("templates", TemplateSchema);