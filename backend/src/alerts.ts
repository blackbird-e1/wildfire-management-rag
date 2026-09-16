import { Router } from "express";
import { addSubscriber } from "./lib/db";

const router = Router();

router.post("/subscribe", async (req, res): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      res.status(400).json({
        success: false,
        message: "Email is required.",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });

      return;
    }

    const result = await addSubscriber(normalizedEmail);

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Subscription failed:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to subscribe right now.",
    });
  }
});

export default router;