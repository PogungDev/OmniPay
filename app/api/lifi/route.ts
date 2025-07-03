import { type NextRequest, NextResponse } from "next/server"
import { lifiSDK } from "@/lib/lifi-real"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromChain, toChain, fromToken, toToken, fromAddress, fromAmount, toAddress, slippage } = body

    // Validate required fields
    if (!fromChain || !toChain || !fromToken || !toToken || !fromAddress || !fromAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize LI.FI SDK if not already done
    if (!lifiSDK.getConfig().integrator) {
      await lifiSDK.initialize()
    }

    console.log('🔍 LI.FI API: Getting quote for:', {
      fromChain: parseInt(fromChain),
      toChain: parseInt(toChain),
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      toAddress: toAddress || fromAddress,
    })

    // Get quote using real LI.FI SDK
    const quote = await lifiSDK.getQuote({
      fromChain: parseInt(fromChain),
      toChain: parseInt(toChain),
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      toAddress: toAddress || fromAddress,
      slippage: slippage || 0.03,
    })

    console.log('✅ LI.FI API: Quote received:', quote)

    return NextResponse.json({
      success: true,
      quote,
      route: quote.route,
    })
  } catch (error: any) {
    console.error("❌ Error in LI.FI route API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to calculate route",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

    console.log('🔍 LI.FI API: Checking status for:', { txHash, fromChain, toChain, bridge })

    // Get status using real LI.FI SDK
    const status = await lifiSDK.getTransferStatus({
      fromChain: parseInt(fromChain),
      toChain: parseInt(toChain),
      txHash,
      bridge: bridge || undefined,
    })

    console.log('✅ LI.FI API: Status received:', status)

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error: any) {
    console.error("❌ Error in LI.FI status API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to get status",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
