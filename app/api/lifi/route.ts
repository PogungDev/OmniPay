import { type NextRequest, NextResponse } from "next/server"
import { lifiSDK } from "@/lib/lifi-real"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromChain, toChain, fromToken, toToken, fromAddress, amount, toAddress, slippage } = body

    // Validate required fields
    if (!fromChain || !toChain || !fromToken || !toToken || !fromAddress || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize LI.FI SDK if not already done
    if (!lifiSDK.getConfig()) {
      await lifiSDK.initialize()
    }

    // Get quote using real LI.FI SDK
    const quote = await lifiSDK.getQuote({
      fromChain: parseInt(fromChain),
      toChain: parseInt(toChain),
      fromToken,
      toToken,
      fromAmount: amount,
      fromAddress,
      toAddress,
      slippage: slippage || 0.03,
    })

    return NextResponse.json({
      success: true,
      quote,
      route: quote.route,
    })
  } catch (error: any) {
    console.error("Error in LI.FI route API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to calculate route",
      success: false 
    }, { status: 500 })
  }
}

// GET endpoint for status checking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txHash = searchParams.get('txHash')
    const fromChain = searchParams.get('fromChain')
    const toChain = searchParams.get('toChain')
    const bridge = searchParams.get('bridge')

    if (!txHash || !fromChain || !toChain) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get status using real LI.FI SDK
    const status = await lifiSDK.getTransferStatus({
      fromChain: parseInt(fromChain),
      toChain: parseInt(toChain),
      txHash,
      bridge: bridge || undefined,
    })

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error: any) {
    console.error("Error in LI.FI status API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to get status",
      success: false 
    }, { status: 500 })
  }
}
