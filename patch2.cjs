const fs = require('fs');
let lines = fs.readFileSync('client/src/pages/PDP.tsx', 'utf8').split('\n');
const replacement = `            {availability?.status === 'OUT_OF_STOCK' ? (
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
            )}`;
lines.splice(455, 8, replacement); // 456 is index 455
fs.writeFileSync('client/src/pages/PDP.tsx', lines.join('\n'));
