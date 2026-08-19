const fs = require('fs');
let code = fs.readFileSync('client/src/pages/PDP.tsx', 'utf8');

const target = `          {/* Add to Cart & Buy Now Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="pdp-add-to-bag-btn"
              onClick={handleAddToCart}
              className="flex-1 bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm border border-[#C28E46]/60 group"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Shopping Bag</span>
            </button>
            <button`;

const replacement = `          {/* Add to Cart & Buy Now Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {availability?.status === 'OUT_OF_STOCK' ? (
              <button
                id="pdp-add-to-bag-btn-disabled"
                disabled
                className="flex-1 bg-stone-300 text-stone-500 font-bold py-4 rounded-xl shadow-none flex items-center justify-center gap-2 text-sm border border-stone-300 cursor-not-allowed"
              >
                <span>Out of Stock</span>
              </button>
            ) : (
              <button
                id="pdp-add-to-bag-btn"
                onClick={handleAddToCart}
                disabled={isInventoryLoading}
                className={\`flex-1 bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm border border-[#C28E46]/60 group \${isInventoryLoading ? 'opacity-70 cursor-wait' : ''}\`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isInventoryLoading ? 'Checking...' : 'Add to Shopping Bag'}</span>
              </button>
            )}
            <button`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('client/src/pages/PDP.tsx', code);
  console.log("Success");
} else {
  console.log("Target not found!");
}
