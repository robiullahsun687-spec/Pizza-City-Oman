import mongoose from "mongoose";

const MenuItemSizeSubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  multiplier: { type: Number, required: true },
  inch: { type: Number },
  slices: { type: Number },
}, { _id: false });

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sizes: { type: [MenuItemSizeSubSchema], default: undefined },
});

const MongoMenuItem = mongoose.model("MenuItem", MenuItemSchema);

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test_pizza");
  await MongoMenuItem.deleteMany({});
  const item = await MongoMenuItem.create({
    name: "Test",
    sizes: [{ name: "Small", label: "Small", multiplier: 1 }]
  });
  console.log("Before:", item.sizes);
  
  const doc = await MongoMenuItem.findById(item._id);
  const updates = { sizes: [{ name: "Large", label: "Large", multiplier: 2 }] };
  
  Object.assign(doc, updates);
  await doc.save();
  
  const finalDoc = await MongoMenuItem.findById(item._id);
  console.log("After Object.assign:", finalDoc.sizes);
  
  // Try with set()
  const doc2 = await MongoMenuItem.findById(item._id);
  doc2.set({ sizes: [{ name: "Medium", label: "Medium", multiplier: 1.5 }] });
  await doc2.save();
  
  const finalDoc2 = await MongoMenuItem.findById(item._id);
  console.log("After set():", finalDoc2.sizes);
  
  await mongoose.disconnect();
}
run().catch(console.error);
