import { supabaseAdmin } from './client'
import type { Database } from './client'

type FixedExtension = Database['public']['Tables']['fixed_extensions']['Row']
type CustomExtension = Database['public']['Tables']['custom_extensions']['Row']

export async function getFixedExtensions(): Promise<FixedExtension[]> {
  const { data, error } = await supabaseAdmin
    .from('fixed_extensions')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch fixed extensions: ${error.message}`)
  }

  return data || []
}

export async function getCustomExtensions(): Promise<CustomExtension[]> {
  const { data, error } = await supabaseAdmin
    .from('custom_extensions')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch custom extensions: ${error.message}`)
  }

  return data || []
}

export async function updateFixedExtension(
  name: string,
  blocked: boolean,
): Promise<FixedExtension> {
  const { data, error } = await supabaseAdmin
    .from('fixed_extensions')
    .update({ blocked })
    .eq('name', name)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update fixed extension: ${error.message}`)
  }

  return data
}

export async function addCustomExtension(
  name: string,
): Promise<CustomExtension> {
  const { data, error } = await supabaseAdmin
    .from('custom_extensions')
    .insert({ name })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add custom extension: ${error.message}`)
  }

  return data
}

export async function deleteCustomExtension(name: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('custom_extensions')
    .delete()
    .eq('name', name)

  if (error) {
    throw new Error(`Failed to delete custom extension: ${error.message}`)
  }
}

export async function getAllExtensions() {
  const [fixedExtensions, customExtensions] = await Promise.all([
    getFixedExtensions(),
    getCustomExtensions(),
  ])

  return {
    fixed: fixedExtensions,
    custom: customExtensions,
  }
}
