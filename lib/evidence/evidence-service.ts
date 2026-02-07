import { prisma } from '@/lib/db'
import type {
  ExtractedEvidence,
  DisputeType,
  EvidenceStats,
  EvidenceUploadResult,
  SuggestionRequest,
  EvidenceSuggestion,
} from '@/types/evidence'

// Generate a pattern key from evidence characteristics
export function generatePatternKey(evidence: ExtractedEvidence): string {
  const parts: string[] = [evidence.disputeType]

  switch (evidence.disputeType) {
    case 'concession':
      if (evidence.withinGeoFence !== undefined) {
        parts.push(evidence.withinGeoFence ? 'in_geo' : 'out_geo')
      }
      if (evidence.hasPOD !== undefined) {
        parts.push(evidence.hasPOD ? 'has_pod' : 'no_pod')
      }
      if (evidence.deliveryType) {
        parts.push(evidence.deliveryType.toLowerCase().replace(/\s+/g, '_'))
      }
      if (evidence.impactsDSB !== undefined && evidence.impactsDSB) {
        parts.push('dsb')
      }
      break

    case 'feedback':
      if (evidence.feedbackType) {
        parts.push(evidence.feedbackType.toLowerCase().replace(/\s+/g, '_'))
      }
      break

    case 'rts':
      if (evidence.rtsCode) {
        parts.push(evidence.rtsCode.toLowerCase().replace(/\s+/g, '_'))
      }
      if (evidence.confidence) {
        parts.push(evidence.confidence)
      }
      break
  }

  return parts.join(':')
}

// Generate pattern key from suggestion request
export function generatePatternKeyFromRequest(request: SuggestionRequest): string {
  const parts: string[] = [request.disputeType]

  switch (request.disputeType) {
    case 'concession':
      if (request.withinGeoFence !== undefined) {
        parts.push(request.withinGeoFence ? 'in_geo' : 'out_geo')
      }
      if (request.hasPOD !== undefined) {
        parts.push(request.hasPOD ? 'has_pod' : 'no_pod')
      }
      if (request.deliveryType) {
        parts.push(request.deliveryType.toLowerCase().replace(/\s+/g, '_'))
      }
      if (request.impactsDSB !== undefined && request.impactsDSB) {
        parts.push('dsb')
      }
      break

    case 'feedback':
      if (request.feedbackType) {
        parts.push(request.feedbackType.toLowerCase().replace(/\s+/g, '_'))
      }
      break

    case 'rts':
      if (request.rtsCode) {
        parts.push(request.rtsCode.toLowerCase().replace(/\s+/g, '_'))
      }
      if (request.confidence) {
        parts.push(request.confidence)
      }
      break
  }

  return parts.join(':')
}

// Save extracted evidence to database
export async function saveEvidence(
  evidenceEntries: ExtractedEvidence[]
): Promise<EvidenceUploadResult> {
  const result: EvidenceUploadResult = {
    success: true,
    totalRows: evidenceEntries.length,
    rowsWithEvidence: evidenceEntries.length,
    newPatterns: 0,
    updatedPatterns: 0,
    errors: [],
  }

  for (const evidence of evidenceEntries) {
    try {
      // Save evidence entry
      await prisma.evidenceEntry.create({
        data: {
          trackingId: evidence.trackingId,
          disputeType: evidence.disputeType,
          evidenceText: evidence.evidenceText,
          disputeReason: evidence.disputeReason,
          priority: evidence.priority,
          withinGeoFence: evidence.withinGeoFence,
          hasPOD: evidence.hasPOD,
          deliveryType: evidence.deliveryType,
          impactsDSB: evidence.impactsDSB,
          feedbackType: evidence.feedbackType,
          rtsCode: evidence.rtsCode,
          confidence: evidence.confidence,
          station: evidence.station,
          week: evidence.week,
        },
      })

      // Generate and save/update pattern
      const patternKey = generatePatternKey(evidence)

      const existingPattern = await prisma.evidencePattern.findUnique({
        where: {
          disputeType_patternKey: {
            disputeType: evidence.disputeType,
            patternKey,
          },
        },
      })

      if (existingPattern) {
        // Update usage count and potentially the template if the new evidence is longer
        const updateData: { usageCount: number; evidenceTemplate?: string } = {
          usageCount: existingPattern.usageCount + 1,
        }

        // Use the longer/more detailed evidence as the template
        if (evidence.evidenceText.length > existingPattern.evidenceTemplate.length) {
          updateData.evidenceTemplate = evidence.evidenceText
        }

        await prisma.evidencePattern.update({
          where: { id: existingPattern.id },
          data: updateData,
        })
        result.updatedPatterns++
      } else {
        // Create new pattern
        await prisma.evidencePattern.create({
          data: {
            disputeType: evidence.disputeType,
            patternKey,
            evidenceTemplate: evidence.evidenceText,
            usageCount: 1,
          },
        })
        result.newPatterns++
      }
    } catch (error) {
      result.errors.push(
        `Failed to save evidence for ${evidence.trackingId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  result.success = result.errors.length === 0

  return result
}

// Get knowledge base statistics
export async function getEvidenceStats(): Promise<EvidenceStats> {
  // Get total counts by type
  const entryCounts = await prisma.evidenceEntry.groupBy({
    by: ['disputeType'],
    _count: { id: true },
  })

  const patternCounts = await prisma.evidencePattern.groupBy({
    by: ['disputeType'],
    _count: { id: true },
  })

  // Get top patterns
  const topPatterns = await prisma.evidencePattern.findMany({
    orderBy: { usageCount: 'desc' },
    take: 10,
    select: {
      patternKey: true,
      disputeType: true,
      usageCount: true,
      evidenceTemplate: true,
    },
  })

  // Get recent entries
  const recentEntries = await prisma.evidenceEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      trackingId: true,
      disputeType: true,
      evidenceText: true,
      createdAt: true,
    },
  })

  // Build stats object
  const entriesByType = {
    concession: 0,
    feedback: 0,
    rts: 0,
  }

  for (const entry of entryCounts) {
    if (entry.disputeType in entriesByType) {
      entriesByType[entry.disputeType as DisputeType] = entry._count.id
    }
  }

  const patternsByType = {
    concession: 0,
    feedback: 0,
    rts: 0,
  }

  for (const pattern of patternCounts) {
    if (pattern.disputeType in patternsByType) {
      patternsByType[pattern.disputeType as DisputeType] = pattern._count.id
    }
  }

  return {
    totalEntries:
      entriesByType.concession + entriesByType.feedback + entriesByType.rts,
    entriesByType,
    totalPatterns:
      patternsByType.concession + patternsByType.feedback + patternsByType.rts,
    patternsByType,
    topPatterns,
    recentEntries,
  }
}

// Calculate match score between pattern key and request pattern key
function calculateMatchScore(patternKey: string, requestKey: string): number {
  const patternParts = patternKey.split(':')
  const requestParts = requestKey.split(':')

  // Must match dispute type
  if (patternParts[0] !== requestParts[0]) return 0

  // Count matching parts
  let matches = 1 // dispute type already matches
  for (let i = 1; i < requestParts.length; i++) {
    if (patternParts.includes(requestParts[i])) {
      matches++
    }
  }

  // Score is percentage of request parts that match
  return matches / requestParts.length
}

// Get evidence suggestions for given characteristics
export async function getEvidenceSuggestions(
  request: SuggestionRequest
): Promise<EvidenceSuggestion[]> {
  // Get all patterns for this dispute type
  const patterns = await prisma.evidencePattern.findMany({
    where: { disputeType: request.disputeType },
    orderBy: { usageCount: 'desc' },
  })

  if (patterns.length === 0) {
    return []
  }

  const requestKey = generatePatternKeyFromRequest(request)

  // Score and rank patterns
  const suggestions: EvidenceSuggestion[] = patterns
    .map((pattern) => ({
      patternKey: pattern.patternKey,
      evidenceTemplate: pattern.evidenceTemplate,
      usageCount: pattern.usageCount,
      matchScore: calculateMatchScore(pattern.patternKey, requestKey),
    }))
    .filter((s) => s.matchScore > 0)
    .sort((a, b) => {
      // Sort by match score first, then by usage count
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore
      }
      return b.usageCount - a.usageCount
    })
    .slice(0, 5) // Return top 5 suggestions

  return suggestions
}
