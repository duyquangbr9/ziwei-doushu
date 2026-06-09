// app/api/chart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateChart } from '../../../lib/ziwei/algorithm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const chart = generateChart(body)
  return NextResponse.json(chart, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
