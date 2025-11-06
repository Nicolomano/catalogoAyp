// models/Category.js
import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    // opcional: lista de ancestros para búsquedas rápidas por jerarquía
    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para obtener hijos (no se guarda en DB)
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
  justOne: false,
});

// Pre-save: generar slug y poblar ancestors si parent cambió
categorySchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Si cambió el parent, recalcular ancestors
  if (this.isModified("parent")) {
    if (!this.parent) {
      this.ancestors = [];
    } else {
      // buscar parent y copiar sus ancestors + parent
      const parentDoc = await this.constructor
        .findById(this.parent)
        .select("ancestors _id")
        .lean();
      this.ancestors = parentDoc
        ? [...(parentDoc.ancestors || []), parentDoc._id]
        : [this.parent];
    }
  }

  next();
});

// Índices
categorySchema.index({ name: 1 });

export default mongoose.model("Category", categorySchema);
