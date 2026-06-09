// app/api/chart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateChart } from '../../../lib/ziwei/algorithm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const chart = generateChart(body)
  return NextResponse.json(chart)
}
