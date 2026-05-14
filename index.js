const express = require("express");
const app = express();
const cors = require("cors");
// apply jwt token
const jwt = require("jsonwebtoken");

const { MongoClient, ServerApiVersion, Collection } = require("mongodb");
require("dotenv").config();
const bannerRoutes = require("./collections/banner.js");
const imageCategoryRoute = require("./collections/image-category.js");
const popularDestinationRoute = require("./collections/popular-destination-collection.js");
const packageRoute = require("./collections/package-collection.js");
const adminRoute = require("./collections/admin-controller.js");

const dashboardMenuRoute = require("./collections/dashboard-menu.js");
const bookingRoute = require("./collections/booking-list.js");
const reviewRoute = require("./collections/review.js");
const couponRoute = require("./collections/coupon-collection.js");
const blogRoute = require("./collections/blog-collection.js");
const claimPromoRoute = require("./collections/claim-promo-collection.js");
const galaryRoute = require("./collections/galary-collection.js");
const userRoute = require("./collections/user-collection.js");
const geminiRoute = require("./collections/ai.js");
const port = process.env.PORT || 5000;
const dns = require("dns");

app.use(cors());
app.use(express.json());
app.use("/", geminiRoute);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.da6po2r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    // ############################################ all database collection write here ###########################################

    const database = client.db("aura-tour");
    const bannerCollection = database.collection("banner");
    const imgageCategoryCollection = database.collection("image-category");

    const popularDestinationCollection = database.collection(
      "popular-dest-collection",
    );
    const packageCollection = database.collection("package-collection");

    const adminCollection = database.collection("admin");
    const menuCollection = database.collection("dashboard-menu");
    const parentCatCollection = database.collection("parent-category");

    const bookingCollection = database.collection("booking-collection");
    const reviewCollection = database.collection("review-collection");
    const couponCollection = database.collection("coupon-collection");
    const blogCollection = database.collection("blog-collection");
    const claimPromoCollection = database.collection("claim-promo-collection");
    const userCollection = database.collection("user-collection");
    const galaryCollection = database.collection("galary-collection");

    // ############################################ all database collection write here ###########################################

    // ############################################ all collection route write here ###########################################

    // banner
    app.use("/", bannerRoutes(bannerCollection));

    // image category
    app.use("/", imageCategoryRoute(imgageCategoryCollection));

    // popular destination
    app.use("/", popularDestinationRoute(popularDestinationCollection));

    // package
    app.use("/", packageRoute(packageCollection));

    // admin controller
    app.use("/", adminRoute(adminCollection));

    // dashboard menu
    app.use("/", dashboardMenuRoute(menuCollection));

    // orders
    app.use("/", bookingRoute(bookingCollection));

    // review
    app.use("/", reviewRoute(reviewCollection));

    // coupon
    app.use("/", couponRoute(couponCollection));

    // blog
    app.use("/", blogRoute(blogCollection));

    // blog
    app.use("/", claimPromoRoute(claimPromoCollection));

    // user
    app.use("/", userRoute(userCollection));
    // galary collection
    app.use("/", galaryRoute(galaryCollection));

    // ############################################ all collection route write here ###########################################

    // jwt related api
    app.post("/get-token", async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "10d",
      });

      res.send({
        token,
      });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tourism server running...!");
});

app.listen(port, () => {
  console.log(`Tourism server running at port ${port}`);
});
