import {
  IBaseExtension,
  EXTENSION_CONSTANTS,
} from '@/app/components/extensions/BaseExtensions.type'
import { useState } from 'react'

export interface ICustomExtension extends IBaseExtension {
  id: number
  readonly: false
  createdAt: Date
  userId?: string
}

export type ICustomExtensions = ICustomExtension[]

interface CustomExtensionsProps {
  extensions: ICustomExtensions
  fixedExtensions: string[]
  onAdd: (extensionName: string) => Promise<void>
  onDelete: (extensionName: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export const CustomExtensions = ({
  extensions,
  fixedExtensions,
  onAdd,
  onDelete,
  isLoading = false,
  error = null,
}: CustomExtensionsProps) => {
  const [newExtension, setNewExtension] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateExtension = (value: string): string | null => {
    const trimmed = value.trim().toLowerCase()
    const safeExtensions = extensions || []
    const safeFixedExtensions = fixedExtensions || []

    if (!trimmed) return '확장자를 입력해주세요.'
    if (trimmed.length > EXTENSION_CONSTANTS.MAX_EXTENSION_LENGTH) {
      return `확장자는 최대 ${EXTENSION_CONSTANTS.MAX_EXTENSION_LENGTH}자까지 입력할 수 있습니다.`
    }
    if (safeExtensions.length >= EXTENSION_CONSTANTS.MAX_CUSTOM_EXTENSIONS) {
      return `커스텀 확장자는 최대 ${EXTENSION_CONSTANTS.MAX_CUSTOM_EXTENSIONS}개까지 추가할 수 있습니다.`
    }
    if (safeExtensions.some((ext) => ext.name === trimmed))
      return '이미 등록된 확장자입니다.'
    if (safeFixedExtensions.includes(trimmed))
      return '고정 확장자는 추가할 수 없습니다.'

    return null
  }

  const handleAddExtension = async () => {
    const trimmed = newExtension.trim().toLowerCase()
    const validationError = validateExtension(trimmed)

    if (validationError) {
      alert(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await onAdd(trimmed)
      setNewExtension('')
    } catch (error) {
      console.error('Failed to add extension:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExtension = async (name: string) => {
    try {
      await onDelete(name)
    } catch (error) {
      console.error('Failed to delete extension:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddExtension()
    }
  }

  return (
    <Section>
      <SectionTitle>커스텀 확장자</SectionTitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <InputGroup>
        <StyledInput
          type="text"
          value={newExtension}
          onChange={(e) => setNewExtension(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={EXTENSION_CONSTANTS.MAX_EXTENSION_LENGTH}
          placeholder="확장자 입력"
          disabled={isLoading || isSubmitting}
        />
        <AddButton
          onClick={handleAddExtension}
          disabled={isLoading || isSubmitting || !newExtension.trim()}
        >
          {isSubmitting ? '추가 중...' : '+ 추가'}
        </AddButton>
      </InputGroup>

      <TagContainer>
        {isLoading ? (
          <LoadingMessage>확장자 목록을 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <TagGrid>
              {(extensions || []).map((ext) => (
                <ExtensionTag
                  key={ext.id}
                  extension={ext}
                  onDelete={handleDeleteExtension}
                />
              ))}
            </TagGrid>
            <Counter>
              {(extensions || []).length}/
              {EXTENSION_CONSTANTS.MAX_CUSTOM_EXTENSIONS}
            </Counter>
          </>
        )}
      </TagContainer>
    </Section>
  )
}

interface ExtensionTagProps {
  extension: ICustomExtension
  onDelete: (name: string) => void
}

const ExtensionTag = ({ extension, onDelete }: ExtensionTagProps) => (
  <Tag>
    <TagText>{extension.name}</TagText>
    <DeleteButton onClick={() => onDelete(extension.name)}>
      &times;
    </DeleteButton>
  </Tag>
)

const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6">{children}</div>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-semibold text-gray-700 mb-2">{children}</h2>
)

const InputGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3">{children}</div>
)

const StyledInput = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
    {...props}
  />
)

const AddButton = ({
  children,
  disabled,
  ...props
}: {
  children: React.ReactNode
  disabled?: boolean
  [key: string]: any
}) => (
  <button
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      disabled
        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
        : 'bg-gray-700 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
    }`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
)

const TagContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-3 border border-gray-200 rounded-md bg-gray-50 min-h-[120px]">
    {children}
  </div>
)

const TagGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-2">{children}</div>
)

const Tag = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-1 rounded-full">
    {children}
  </div>
)

const TagText = ({ children }: { children: React.ReactNode }) => (
  <span>{children}</span>
)

const DeleteButton = ({ ...props }) => (
  <button
    className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors"
    {...props}
  />
)

const Counter = ({ children }: { children: React.ReactNode }) => (
  <p className="text-right text-sm text-gray-500 mt-2 pr-1">{children}</p>
)

const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
    {children}
  </div>
)

const LoadingMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center h-20 text-gray-500">
    {children}
  </div>
)
