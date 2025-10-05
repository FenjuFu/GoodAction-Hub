import { NextResponse } from 'next/server'
import yaml from 'yaml'
import fs from 'fs'
import path from 'path'
import { DeadlineItem } from '@/lib/data'

function loadData(): DeadlineItem[] {
  const conferencesPath = path.join(process.cwd(), 'data', 'conferences.yml')
  const competitionsPath = path.join(process.cwd(), 'data', 'competitions.yml')
  const activitiesPath = path.join(process.cwd(), 'data', 'activities.yml')
  
  const conferencesData = yaml.parse(fs.readFileSync(conferencesPath, 'utf8')) as DeadlineItem[]
  const competitionsData = yaml.parse(fs.readFileSync(competitionsPath, 'utf8')) as DeadlineItem[]
  const activitiesData = yaml.parse(fs.readFileSync(activitiesPath, 'utf8')) as DeadlineItem[]
  
  return [...conferencesData, ...competitionsData, ...activitiesData]
}

export async function GET() {
  try {
    const data = loadData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to load data:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}
