const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
var fs = require('fs');
const SSLCommerz = require('sslcommerz-nodejs');
const Template = require("../../models/Template")

//importing Schema

//importing validation
const validateTemplateInput = require("../../validator/template");
const Order = require("../../models/Order");
const { default: axios } = require("axios");
const upload = require("../../utils/uploadFiles");

let settings = {
    isSandboxMode: true, //false if live version
    store_id: "benga5ff19adc4d240",
    store_passwd: "benga5ff19adc4d240@ssl"
}

let sslcommerz = new SSLCommerz(settings);

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filtering() {
        const queryObj = { ...this.queryString };
        const excludedfields = ['page', "sort", 'limit'];
        excludedfields.forEach(el => delete queryObj[el]);
        let querystr = JSON.stringify(queryObj);
        querystr = querystr.replace(/\b(gte||gt||lt||lte)\b/g, match => `${match}`);
        this.query.find(JSON.parse(querystr));
        return this
    }
    sorting() {
        if (this.queryString.sort) {
            const sortby = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortby);
        }
        else {
            this.query = this.query.sort("-createdAt");
        }
        return this
    }
    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 4;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

//route POST api/template/payment
router.post("/payment", (req, res) => {

    sslcommerz.init_transaction(req.body).then(response => {
        res.json(response.GatewayPageURL);
        //console.log(post_body);
    }).catch(error => {
        res.json(error);
    })

})


//@router POST ipn
router.post("/payment/success", (req, res) => {
    const body = req.body;
    let body_post = {};
    body_post['val_id'] = req.body.val_id;
    body_post['store_id'] = "benga5ff19adc4d240";
    body_post['store_passwd'] = "benga5ff19adc4d240@ssl";

    axios
        .get("https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php", {
            params: body_post
        })
        .then(response => {
            //res.json(response);
            console.log(response.data);
            if (response.data.status === 'VALIDATED' || response.data.status === 'VALID') {
                new Order({
                    trans_date: response.data.tran_date,
                    trans_id: response.data.tran_id,
                    amount: response.data.amount,
                    card_type: response.data.card_type,
                })
                    .save()
                    .then(response => res.json(response))
                    .catch(err => res.json("Unable to add to database"));

                res.redirect('https://www.bengalsoftware.com/transaction-success');
            }
            else if (response.data.status === 'INVALID_TRANSACTION') {
                res.redirect('https://www.bengalsoftware.com/transaction-failed')
            }
        })
        .catch(err => {
            console.log(err);
        })
    //new Order.save({name : body_post['val_id']}).then(response => res.json(response))
    //console.log(body);
})

// @route GET api/template/test
// @desc testing the route
// @access Public
router.get("/test", (req, res) => {
    res.json({ msg: " This route works " })
})

// @route GET api/template
// @desc Get all the templates
// @access Public
router.get("/", async(req, res) => {
    const errors = {};
try {
    const template = await Template.find().sort({ date: -1 });
    res.json(template);
} catch (error) {

    res.status(400).json(error);
}
    // Template.find().sort({ createdAt: -1 })
    //     .then((template) => {
    //         if (!template) {
    //             error.noTemplate = "There are no templates"
    //             res.status(400).json(errors)
    //         }
    //         else {
    //             res.json(template);
    //         }
    //     })
    //     .catch(err => {
    //         res.status(400).json(err);
    //     })

        
})
// @route GET api/template/query
// @desc GET a template via field
// @access Public
router.get("/query", async (req, res) => {
    const errors = {};
    const match = {};
    try {
        const features = new APIfeatures(Template.find(), req.query)
            .filtering()
            .sorting()

        const templates = await features.query;
        res.status(200).json(templates)
    } catch (err) {
        res.status(404).json({
            status: "Fail",
            message: err
        })
    }
})

// @route GET api/template
// @desc GET a template via category
// @access Public
router.get("/query/:name", (req, res) => {
    const errors = {};

    Template
        .find({ category: req.params.name })
        .then((template) => {
            if (!template) {
                error.noTemplate = "There are no templates"
                res.status(400).json(errors)
            }
            else {
                res.json(template);
            }
        })
        .catch(err => {
            res.status(400).json(err);
        })
})

// @route GET api/template/:id
// @desc Get template by id
// @access Public
router.get("/:id", async (req, res) => {
    console.log(req.params.id)
    try {
        const template = await Template.findOne({ _id: req.params.id });
        res.json({ template, message: "Success" });
    } catch (error) {
        res.status(400).json({ noUser: "There are no template with the ID" });
    }

})

// @route POST api/template
// @desc Post a template
// @access Public
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    upload.single("coverPicture"),
    (req, res) => {
        const { errors, isValid } = validateTemplateInput(req.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }
        const templateFields = {};

        templateFields.user = req.user.id;
        /*
            var zip = new AdmZip(req.files.templateFiles.path);
            zip.extractAllTo('../../uploads/', true);
            console.log(req.files.templateFiles)
            //res.send(req.file);  
        */
        if (req.body.category) templateFields.category = req.body.category;
        //if (req.body.subCategory) templateFields.subCategory = req.body.subCategory;
        if (req.body.title) templateFields.title = req.body.title;
        if (req.body.caption) templateFields.caption = req.body.caption;
        if (req.body.description) templateFields.description = req.body.description;
        if (req.body.liveDemo) templateFields.liveDemo = req.body.liveDemo;
        //if (req.files.templateFiles[0].path) templateFields.templateFiles = req.files.templateFiles[0].path;
        if (req.file?.path) templateFields.coverPicture = req.file.path;
        if (req.body.features) templateFields.features = req.body.features;
        if (req.body.additionalFeatures) templateFields.additionalFeatures = req.body.additionalFeatures;
        if (req.body.functionalities) templateFields.functionalities = req.body.functionalities;
        if (req.body.wordpressVersion) templateFields.wordpressVersion = req.body.wordpressVersion;
        if (req.body.woocommerceVersion) templateFields.woocommerceVersion = req.body.woocommerceVersion;
        if (req.body.builder) templateFields.builder = req.body.builder;
        if (req.body.support) templateFields.support = req.body.support;
        if (req.body.version) templateFields.version = req.body.version;
        if (req.body.price) templateFields.price = req.body.price;
        if (req.body.terms) templateFields.terms = req.body.terms;
        if (req.body.saleAvailable) templateFields.saleAvailable = req.body.saleAvailable;
        if (req.body.compatibility) templateFields.compatibility = req.body.compatibility;
        // tech - Spilt into array
        if (typeof req.body.tech !== "undefined") {
            templateFields.tech = req.body.tech.split(",");
        }
        //compatibility -Split into array
        /*
        if (typeof req.body.compatibility !== "undefined") {
            templateFields.compatibility = req.body.compatibility.split(",");
        }
        */
        templateFields.services = {};
        if (req.body.installation) templateFields.services.installation = req.body.installation;
        if (req.body.installationPrice) templateFields.services.installationPrice = req.body.installationPrice;
        if (req.body.installationDeadline) templateFields.services.installationDeadline = req.body.installationDeadline;
        if (req.body.conversion) templateFields.services.conversion = req.body.conversion;
        if (req.body.conversionPrice) templateFields.services.conversionPrice = req.body.conversionPrice;
        if (req.body.conversionDeadline) templateFields.services.conversionDeadline = req.body.conversionDeadline;
        if (req.body.customization) templateFields.services.customization = req.body.customization;
        if (req.body.customizationPrice) templateFields.services.customizationPrice = req.body.customizationPrice;
        if (req.body.customizationDeadline) templateFields.services.customizationDeadline = req.body.customizationDeadline;
        if (req.body.seo) templateFields.services.seo = req.body.seo;
        if (req.body.seoPrice) templateFields.services.seoPrice = req.body.seoPrice;
        if (req.body.seoDeadline) templateFields.services.seoDeadline = req.body.seoDeadline;
        if (req.body.emailMarketing) templateFields.services.emailMarketing = req.body.emailMarketing;
        if (req.body.emailMarketingPrice) templateFields.services.emailMarketingPrice = req.body.emailMarketingPrice;
        if (req.body.emailMarketingDeadline) templateFields.services.emailMarketingDeadline = req.body.emailMarketingDeadline;
        if (req.body.logo) templateFields.services.logo = req.body.logo;
        if (req.body.logoPrice) templateFields.services.logoPrice = req.body.logoPrice;
        if (req.body.logoDeadline) templateFields.services.logoDeadline = req.body.logoDeadline;
        if (req.body.contentAdd) templateFields.services.contentAdd = req.body.contentAdd;
        if (req.body.contentAddPrice) templateFields.services.contentAddPrice = req.body.contentAddPrice;
        if (req.body.contentAddDeadline) templateFields.services.contentAddDeadline = req.body.contentAddDeadline;


        new Template(templateFields)
            .save()
            .then((template) => res.json(template))
    })

// @route Delete api/template/:id
// @desc Delete a template
// @access Public
router.delete("/:id", (req, res) => {
    const errors = {}
    Template
        .findById(req.params.id)
        .then((template) => {
            if (!template) {
                errors.noTemplate = "No template found";
                res.status(404).json(errors);
            }
            template.remove().then((res) => res.send("Successful"));
        })
        .catch((err) => res.status(404).json(err));
})

// @route   POST api/template/activate/:id
// @desc    Activate a template
// @access  Private
router.post(
    '/activate/:id',
    //passport.authenticate('jwt', {session: false}),
    (req, res) => {
        const error = {};
        Template
            .findById(req.params.id)
            .then(template => {
                if (!template) {
                    error.notemplate = "No template Found";
                    res.status(404).json(error);
                }
                else {
                    template.activate = !template.activate;
                    template.save().then(template => res.json(template))
                }
            })
            .catch(err => {
                res.status(400).json(err);
            })
    }
);


module.exports = router;


