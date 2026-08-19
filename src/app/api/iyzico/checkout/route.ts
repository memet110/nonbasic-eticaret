import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";

export async function POST(req: Request) {
  try {
    require("postman-request");
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY || "sandbox-dummy",
      secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-dummy",
      uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com"
    });
    
    const body = await req.json();

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: body.conversationId || Date.now().toString(),
      price: body.price.toString(),
      paidPrice: body.price.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: 'B67832',
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/iyzico/callback`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: 'BY789',
        name: body.buyer.name,
        surname: body.buyer.surname,
        gsmNumber: body.buyer.phone || "+905350000000",
        email: body.buyer.email,
        identityNumber: '74300864791',
        lastLoginDate: '2023-10-05 12:43:35',
        registrationDate: '2023-04-21 15:12:09',
        registrationAddress: body.buyer.address,
        ip: '85.34.78.112',
        city: body.buyer.city,
        country: 'Turkey',
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: `${body.buyer.name} ${body.buyer.surname}`,
        city: body.buyer.city,
        country: 'Turkey',
        address: body.buyer.address,
        zipCode: '34742'
      },
      billingAddress: {
        contactName: `${body.buyer.name} ${body.buyer.surname}`,
        city: body.buyer.city,
        country: 'Turkey',
        address: body.buyer.address,
        zipCode: '34742'
      },
      basketItems: body.basketItems.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        category1: item.category1 || 'Giyim',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: item.price.toString()
      }))
    };

    return new Promise<Response>((resolve) => {
      iyzipay.checkoutFormInitialize.create(request, function (err: any, result: any) {
        if (err || result.status !== "success") {
          console.error("Iyzico Error:", err || result.errorMessage);
          resolve(NextResponse.json({ error: err || result.errorMessage }, { status: 400 }));
        } else {
          resolve(NextResponse.json({ 
            paymentPageUrl: result.paymentPageUrl,
            checkoutFormContent: result.checkoutFormContent,
            token: result.token
          }));
        }
      });
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
