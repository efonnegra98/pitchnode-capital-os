import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  // Return a 1x1 transparent GIF regardless — tracking pixel must always return an image
  const transparentGif = new Uint8Array([
    0x47,0x49,0x46,0x38,0x39,0x61,0x01,0x00,0x01,0x00,0x80,0x00,0x00,
    0xff,0xff,0xff,0x00,0x00,0x00,0x21,0xf9,0x04,0x00,0x00,0x00,0x00,
    0x00,0x2c,0x00,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0x02,0x02,
    0x44,0x01,0x00,0x3b
  ]);

  try {
    const url = new URL(req.url);
    const updateId = url.searchParams.get("updateId");
    const recipientId = url.searchParams.get("recipientId");

    if (updateId && recipientId) {
      const base44 = createClientFromRequest(req);

      // Fetch the current update record using service role (no user auth needed for pixel)
      const updates = await base44.asServiceRole.entities.MonthlyUpdate.filter({ id: updateId });
      const update = updates[0];

      if (update) {
        const openedIds = update.opened_investor_ids || [];
        // Only record if not already tracked
        if (!openedIds.includes(recipientId)) {
          const newOpenedIds = [...openedIds, recipientId];
          await base44.asServiceRole.entities.MonthlyUpdate.update(updateId, {
            opened_investor_ids: newOpenedIds,
            opened_count: newOpenedIds.length,
          });
        }
      }
    }
  } catch (err) {
    // Silently fail — always return the pixel
    console.error("Tracking error:", err.message);
  }

  return new Response(transparentGif, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
});