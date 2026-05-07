"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiscountName = createDiscountName;
/**
 * Create the discount name based on sibling discount and camp credit
 * @param siblingDiscountAmount
 * @param campCreditUsed
 * @returns
 */
function createDiscountName(siblingDiscountAmount, campCreditUsed) {
    const discountName = [];
    if (siblingDiscountAmount > 0) {
        discountName.push(`$${siblingDiscountAmount} Sibling Discount`);
    }
    if (campCreditUsed > 0) {
        discountName.push(`$${campCreditUsed} Camp Credit`);
    }
    return discountName.join(" + ");
}
//# sourceMappingURL=createDiscountName.js.map