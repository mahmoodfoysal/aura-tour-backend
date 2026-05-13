const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const blogRoute = (blogCollection) => {
  // get api
  router.get("/api/tourism/get-blog-list", async (req, res) => {
    const getBlogList = blogCollection.find();
    const result = await getBlogList.toArray();
    res.send({
      status: 200,
      list_data: result,
      message: "Successful",
    });
  });

  // get single blog
  router.get("/api/tourism/get-blog-list/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const query = {
        _id: new ObjectId(id),
      };

      const result = await blogCollection.findOne(query);

      if (!result) {
        return res.status(404).send({
          status: 404,
          message: "Not found",
        });
      }

      res.status(200).send({
        status: 200,
        details_data: result,
        message: "Successful",
      });
    } catch (error) {
      res.status(500).send({
        error: "Failed to fetch",
      });
    }
  });

  //   post api
  router.post(
    "/api/tourism/insert-update-blog-list",
    verifyJWT,
    async (req, res) => {
      const {
        _id,
        id,
        title,
        excerpt,
        image,
        date,
        author,
        authorImage,
        category,
        status,
        readingTime,
        tags,
        content,
      } = req.body;

      const data = {
        id: typeof id === "number" ? id : null,
        title: typeof title === "string" ? title : null,
        excerpt: typeof excerpt === "string" ? excerpt : null,
        image: typeof image === "string" ? image : null,
        date: typeof date === "string" ? date : null,
        author: typeof author === "string" ? author : null,
        authorImage: typeof authorImage === "string" ? authorImage : null,
        category: typeof category === "string" ? category : null,
        status: typeof status === "number" ? status : null,
        readingTime: typeof readingTime === "string" ? readingTime : null,
        tags:
          Array.isArray(tags) && tags.every((tag) => typeof tag === "string")
            ? tags
            : [],
        content: typeof content === "string" ? content : null,
      };

      if (
        data.id === null ||
        !data.title ||
        !data.excerpt ||
        !data.image ||
        !data.date ||
        !data.author ||
        !data.authorImage ||
        !data.category ||
        data.status === null ||
        !data.readingTime ||
        !data.content
      ) {
        return res
          .status(400)
          .send({ error: "Invalid or missing required fields", status: 400 });
      }

      try {
        if (_id) {
          const blogId = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await blogCollection.updateOne(
            {
              _id: blogId,
            },
            {
              $set: data,
            },
          );
          if (result.modifiedCount === 0) {
            return res
              .status(400)
              .send({ message: "No data modified", status: 400 });
          }
          res
            .status(201)
            .send({ message: "Update Successful", id: _id, status: 201 });
        } else {
          data.createdAt = new Date();
          const result = await blogCollection.insertOne(data);
          res.status(201).send({
            status: 201,
            message: "Successful",
            id: result.insertedId,
            status: 201,
          });
        }
      } catch (error) {
        res
          .status(500)
          .send({ error: "Failed to create or update", status: 500 });
      }
    },
  );

  router.patch(
    "/api/admin/update-blog-status/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const { status, user_info } = req.body;
        const updateDoc = {
          $set: { status, user_info, modifiedAt: new Date() },
        };

        const result = await blogCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Not found" });
        }

        res.status(200).send({
          status: 200,
          id: id,
          status_code: status,
          message: status === 1 ? "Active successful" : "Inactive successful",
        });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ message: "An error occurred while updating the status." });
      }
    },
  );

  // delete api
  router.delete(
    "/api/tourism/delete-blog-list/:id",
    verifyJWT,
    async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await blogCollection.deleteOne(filter);
      res.status(200).send({
        status: 200,
        message: "Successful",
        deletedCount: result?.deletedCount,
      });
    },
  );

  return router;
};

module.exports = blogRoute;
