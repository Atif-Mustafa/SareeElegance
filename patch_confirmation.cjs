const fs = require('fs');

let content = fs.readFileSync('client/src/pages/OrderConfirmationPage.tsx', 'utf-8');

// We will add shipment state and fetch it
content = content.replace("const [order, setOrder] = useState<any | null>(null);", 
  "const [order, setOrder] = useState<any | null>(null);\n  const [shipment, setShipment] = useState<any | null>(null);");

const fetchReplacement = `const fetchOrder = async () => {
    try {
      const res = await fetch(\`/api/v1/orders/\${id}?accessToken=\${accessToken}\`);
      if (!res.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await res.json();
      setOrder(data);
      
      // Try to fetch shipment
      try {
        const shipRes = await fetch(\`/api/v1/orders/\${id}/shipment?accessToken=\${accessToken}\`);
        if (shipRes.ok) {
          const shipData = await shipRes.json();
          setShipment(shipData);
        }
      } catch(e) {
        // Shipment might not exist yet
      }

    } catch (err: any) {
      setError(err.message || 'Unable to load order details');
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(/const fetchOrder = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/m, fetchReplacement);

const shipmentUIRender = `{shipment && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm text-left max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#2C221E] border-b border-[#F3EFE6] pb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C28E46]" /> Shipment Tracking
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
              <span className="text-stone-500">Status</span>
              <span className="font-bold text-[#2C221E]">{shipment.status}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
              <span className="text-stone-500">Carrier</span>
              <span className="font-bold text-[#2C221E]">{shipment.provider}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
              <span className="text-stone-500">Tracking Number</span>
              <span className="font-bold text-[#2C221E]">{shipment.trackingNumber || 'Pending'}</span>
            </div>
            {shipment.dispatchedAt && (
              <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
                <span className="text-stone-500">Dispatched At</span>
                <span className="font-bold text-[#2C221E]">{new Date(shipment.dispatchedAt).toLocaleString()}</span>
              </div>
            )}
            {shipment.deliveredAt && (
              <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
                <span className="text-stone-500">Delivered At</span>
                <span className="font-bold text-[#2C221E]">{new Date(shipment.deliveredAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}`;

content = content.replace("{/* Receipt Box */}", shipmentUIRender + "\n\n      {/* Receipt Box */}");

fs.writeFileSync('client/src/pages/OrderConfirmationPage.tsx', content);
