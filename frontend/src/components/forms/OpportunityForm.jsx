import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'
import { dummyDataService } from '../../services/dummyDataService'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { OPPORTUNITY_TYPES } from '../../types'
import { validateDriveLink, formatDriveLink } from '../../utils/validateDriveLink'
import toast from 'react-hot-toast'

const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  type: z.string().min(1, 'Type is required'),
  skills: z.string().optional(),
  timeline: z.string().optional(),
  positions: z.string().optional(),
  materialLink: z.string().optional().refine((val) => !val || validateDriveLink(val), {
    message: 'Must be a valid Google Drive link',
  }),
})

export function OpportunityForm({ onSuccess, onCancel }) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const skills = data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : []
      
      const opportunityData = {
        title: data.title,
        description: data.description,
        type: data.type,
        skills,
        timeline: data.timeline || null,
        positions: data.positions ? parseInt(data.positions, 10) : null,
        materialLink: data.materialLink ? formatDriveLink(data.materialLink) : null,
        organizationId: currentUser.uid,
        published: false,
      }

      dummyDataService.createOpportunity(opportunityData)
      toast.success('Opportunity created successfully!')
      onSuccess?.()
    } catch (error) {
      toast.error(error.message || 'Failed to create opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Opportunity Title"
        placeholder="e.g., Python Workshop for Beginners"
        {...register('title')}
        error={errors.title?.message}
      />
      
      <Textarea
        label="Description"
        placeholder="Describe the opportunity, what participants will learn, and requirements..."
        rows={5}
        {...register('description')}
        error={errors.description?.message}
      />
      
      <Select
        label="Type"
        {...register('type')}
        error={errors.type?.message}
      >
        <option value="">Select type</option>
        <option value={OPPORTUNITY_TYPES.COURSE}>Course</option>
        <option value={OPPORTUNITY_TYPES.WORKSHOP}>Workshop</option>
        <option value={OPPORTUNITY_TYPES.COMPETITION}>Competition</option>
        <option value={OPPORTUNITY_TYPES.TRAINING}>Training</option>
      </Select>
      
      <Input
        label="Required Skills (comma-separated, optional)"
        placeholder="e.g., Python, Web Development"
        {...register('skills')}
        error={errors.skills?.message}
      />
      
      <Input
        label="Timeline (optional)"
        placeholder="e.g., 4 weeks, Starting March 2024"
        {...register('timeline')}
        error={errors.timeline?.message}
      />
      
      <Input
        type="number"
        label="Number of Positions (optional)"
        placeholder="20"
        min="1"
        {...register('positions')}
        error={errors.positions?.message}
      />
      
      <Input
        label="Materials Link (Google Drive, optional)"
        placeholder="https://drive.google.com/..."
        {...register('materialLink')}
        error={errors.materialLink?.message}
      />
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create Opportunity'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}


