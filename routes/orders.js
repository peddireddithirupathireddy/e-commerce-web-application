const router = require("express").Router();

const Order = require("../models/Order");
const Product = require("../models/Product");

const {
  auth,
  adminOnly
} = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress
    } = req.body;

    if (
      !items ||
      items.length === 0 ||
      !shippingAddress
    ) {
      return res.status(400).json({
        message:
          "Cart and shipping address are required"
      });
    }

    let total = 0;

    const orderItems = [];

    for (const item of items) {
      const product =
        await Product.findById(
          item.productId
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (
        product.stock <
        item.quantity
      ) {
        return res.status(400).json({
          message:
            `Not enough stock for ${product.name}`
        });
      }

      total +=
        product.price *
        item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      product.stock -= item.quantity;

      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      shippingAddress
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.get(
  "/my",
  auth,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          user: req.user.id
        }).sort({
          createdAt: -1
        });

      res.json(orders);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.get(
  "/",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const orders =
        await Order.find()
          .populate(
            "user",
            "name email"
          )
          .sort({
            createdAt: -1
          });

      res.json(orders);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.patch(
  "/:id/status",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const allowedStatuses = [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ];

      if (
        !allowedStatuses.includes(
          req.body.status
        )
      ) {
        return res.status(400).json({
          message: "Invalid order status"
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status: req.body.status
          },
          {
            new: true
          }
        );

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      res.json(order);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

module.exports = router;
