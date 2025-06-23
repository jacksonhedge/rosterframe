# eBay Production API Compliance Guide

## Your Production Keys are Disabled

To enable your production keys, you need to comply with eBay's marketplace account deletion/closure notification process.

## Option 1: Comply with the Process (Recommended)

### What is this requirement?
eBay requires production apps to handle user account deletions properly. When a user deletes their eBay account, your app needs to:
1. Remove their data from your systems
2. Stop making API calls on their behalf
3. Acknowledge the deletion notification

### Steps to Comply:

1. **Set up a webhook endpoint** in your app to receive notifications:
   ```typescript
   // app/api/ebay/account-deletion/route.ts
   export async function POST(request: Request) {
     // Handle eBay account deletion notifications
     const data = await request.json();
     
     // Log the deletion request
     console.log('eBay account deletion:', data);
     
     // TODO: Remove user data from your database
     // TODO: Cancel any subscriptions
     // TODO: Stop any scheduled API calls
     
     return Response.json({ success: true });
   }
   ```

2. **Register your webhook URL** with eBay:
   - Go to your eBay developer account
   - Add your webhook URL: `https://yourdomain.com/api/ebay/account-deletion`
   - eBay will send test notifications to verify it works

3. **Implement data deletion**:
   - When you receive a deletion notification, remove all user data
   - This includes tokens, preferences, and any cached eBay data

## Option 2: Apply for an Exemption

If your app doesn't store user data or tokens, you may qualify for an exemption.

### Reasons for exemption:
- Your app only does anonymous searches (no user login)
- You don't store any user-specific eBay data
- You don't save eBay authentication tokens

### To apply for exemption:
1. Click the "exemption" link in the eBay developer portal
2. Explain that your app:
   - Only performs public searches for trading cards
   - Doesn't require users to log in with eBay
   - Doesn't store any eBay user data or tokens
   - Only uses the Browse API for public listings

## For Your Use Case

Since your Roster Frame app appears to only search for public eBay listings and doesn't require users to authenticate with eBay, **you likely qualify for an exemption**.

### Suggested exemption request text:
```
Our application "Roster Frame" only uses the eBay Browse API to search for publicly available sports trading card listings. 

We do not:
- Require users to authenticate with eBay
- Store any eBay user tokens or credentials  
- Save any user-specific eBay data
- Make API calls on behalf of specific eBay users

Our app simply searches for trading cards to display prices and availability, similar to how a user would search on eBay.com directly. Since we don't store any eBay user data, there is nothing to delete when a user closes their eBay account.

We request an exemption from the account deletion notification requirement as it does not apply to our use case.
```

## Next Steps

1. **For quick testing**: Continue using the sandbox environment while you sort out compliance
2. **For production**: Either:
   - Apply for an exemption (easier for your use case)
   - Implement the webhook endpoint (if you plan to add user authentication later)

## Important Notes

- This is a one-time setup
- Once approved, your production keys will be permanently enabled
- The process usually takes 1-2 business days
- You can continue development with sandbox keys meanwhile