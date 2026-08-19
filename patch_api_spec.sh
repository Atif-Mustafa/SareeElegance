#!/bin/bash
sed -i 's/Requires the `accessToken` in the payload./Requires `accessToken` via query string or `x-order-token` header. Note: The database now securely stores a SHA-256 hash of the token; the raw token is returned exactly once during order confirmation./g' docs/API_SPEC.md
sed -i 's/Requires the `accessToken`./Requires `accessToken` via query string or `x-order-token` header./g' docs/API_SPEC.md
