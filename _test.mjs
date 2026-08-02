import mongoose from "mongoose";
import { getOptimizedUnitPrice, getEffectiveBasePrice } from "./shared/priceUtils.js";

const OrderSchema = new mongoose.Schema({
  items: [{ menuItemId: String, name: String, size: String, price: { type: Number, required: true }, quantity: Number }],
  customer: { name: { type: String, required: true }, phone: { type: String, required: true } },
  outlet: { type: String, required: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: "pending" },
});

const M = mongoose.model("OT5", OrderSchema);

const menuItems = [
  { price: 2.5, discountPrice: 0, category: "pizza" },
  { price: 1.5, discountPrice: 0, category: "sides" },
  { price: 0.5, discountPrice: 0, category: "drinks" },
  { price: 3.6, discountPrice: -0.001, category: "pizza" },
];

for (const mi of menuItems) {
  const rp = Number(mi.price);
  const bp = getEffectiveBasePrice(rp, Number(mi.discountPrice) || 0);
  const up = getOptimizedUnitPrice(bp, "Medium", 1, mi.category);
  console.log(
    "price=" + mi.price + " disc=" + mi.discountPrice + " -> bp=" + bp + " up=" + up + " typeof=" + typeof up + " undef?=" + (up === undefined) + " finite=" + Number.isFinite(up)
  );
}

const computedItems = [{ menuItemId: "a1", name: "Test", price: 2.5, quantity: 1, size: "Medium" }];
const o = new M({ items: computedItems, customer: { name: "J", phone: "123" }, outlet: "X", subtotal: 2.5, total: 2.5 });
const e = o.validateSync();
console.log("Valid order:", e ? "FAIL: " + e.message : "PASS");
