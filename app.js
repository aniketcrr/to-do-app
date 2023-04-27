const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose');
const { log } = require("console");
mongoose.connect('mongodb+srv://admin-unknown:aniket000@atlascluster.rsbip9u.mongodb.net/todolistDB');

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const itemSchema = {
    name: String
}
const Item = mongoose.model("Item", itemSchema);

const listSchema = {
    name: String,
    item: [itemSchema]
}

const List = mongoose.model("list", listSchema);

const item1 = new Item({
    name: "welcome to my to  do list"
});
const item2 = new Item({
    name: "click + to add value"
});
const item3 = new Item({
    name: "<-- hit this to delete item"
});

const defaultitems = [item1, item2, item3];


app.get("/", async function (req, res) {

    // var today = new Date();

    // var options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };

    // var day = today.toLocaleDateString("en-US", options);


    const r = await Item.find({});
    // console.log(r);

    if (r.length === 0) {
        res.redirect("/");
        Item.insertMany(defaultitems);
    }
    else {

        res.render("list", { kindofDay: "Today", newListItems: r });
    }

});


app.get("/:customListName", async function (req, res) {
    const customlistname = _.capitalize(req.params.customListName);
    console.log(customlistname);


    const find = await List.findOne({ name: customlistname }).exec();

    if (!find) {

        const list = new List({
            name: customlistname,
            item: defaultitems
        });
        list.save();
        const newbie = await List.findOne({ name: customlistname }).exec();
        res.redirect("/" + customlistname);

    } else {
        res.render("list", { kindofDay: find.name, newListItems: find.item });
    }




})

app.post("/", async function (req, res) {
    const itemName = req.body.newItem;
    const listname =  _.capitalize(req.body.list);
    const item = new Item({
        name: itemName
    });

    if (listname === "Today") {
        item.save();

        res.redirect("/");
    } else {
        const add = await List.findOne({ name: listname }).exec();
        add.item.push(item);
        add.save();
        res.redirect("/" + listname);
    }

});

app.post("/deleteb", async function (req, res) {

    const checkeditem = req.body.checkBox;
    const listname =  _.capitalize(req.body.listname);

    console.log(checkeditem);

    if (listname === "Today") {

        await Item.findByIdAndRemove(checkeditem);
        res.redirect("/");
    } else {
     await   List.findOneAndUpdate({ name: listname }, { $pull: { item: { _id: checkeditem } } } )
        res.redirect("/" + listname)
    }
}
);

const port = process.env.PORT || 3000 ;

app.listen(port, function () {
    console.log("server started on port 3000");
});