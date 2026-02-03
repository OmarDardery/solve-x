import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import apiService from '../../services/api'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { OPPORTUNITY_TYPES } from '../../types'
import toast from 'react-hot-toast'

const opportunitySchema = z.object({
  name: z.string().min(1, 'Name is required').min(3, 'Name must be at least 3 characters'),
  details: z.string().min(1, 'Details are required').min(10, 'Details must be at least 10 characters'),
  requirements: z.string().optional(),
  reward: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  tag_ids: z.array(z.number()).optional(),
})

export function OpportunityForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: '',
      details: '',
      requirements: '',
      reward: '',
      type: '',
    },
  })

  useEffect(() => {
    // Fetch available tags
    const fetchTags = async () => {
      try {
        const response = await apiService.getAllTags()
        setTags(response || [])
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }
    fetchTags()
  }, [])

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const opportunityData = {
        name: data.name,
        details: data.details,
        requirements: data.requirements || '',
        reward: data.reward || '',
        type: data.type,
        tag_ids: selectedTags,
      }

      await apiService.createOpportunity(opportunityData)
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
        label="Opportunity Name"
        placeholder="e.g., Machine Learning Research Assistant"
        {...register('name')}
        error={errors.name?.message}
      />
      
      <Controller
        name="details"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Details"
            placeholder="Describe the opportunity, responsibilities, and what students will learn..."
            rows={5}
            {...field}
            error={errors.details?.message}
          />
        )}
      />
      
      <Controller
        name="requirements"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Requirements (optional)"
            placeholder="e.g., Experience with Python, Strong foundation in mathematics"
            rows={3}
            {...field}
            error={errors.requirements?.message}
          />
        )}
      />

      <Controller
        name="reward"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Reward (optional)"
            placeholder="e.g., Research credit, Letter of recommendation, $500 stipend"
            rows={2}
            {...field}
            error={errors.reward?.message}
          />
        )}
      />
      
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select
            label="Type"
            {...field}
            error={errors.type?.message}
          >
            <option value="">Select type</option>
            <option value={OPPORTUNITY_TYPES.RESEARCH}>Research</option>
            <option value={OPPORTUNITY_TYPES.PROJECT}>Project</option>
            <option value={OPPORTUNITY_TYPES.INTERNSHIP}>Internship</option>
          </Select>
        )}
      />

      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
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


