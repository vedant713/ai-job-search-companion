import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (class name merger)', () => {
  describe('basic class name merging', () => {
    it('merges two simple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('merges multiple class names', () => {
      expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
    })

    it('handles single class name', () => {
      expect(cn('foo')).toBe('foo')
    })
  })

  describe('empty inputs', () => {
    it('returns empty string for no inputs', () => {
      expect(cn()).toBe('')
    })

    it('handles empty string inputs', () => {
      expect(cn('', '')).toBe('')
    })

    it('ignores empty strings among valid classes', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar')
    })
  })

  describe('Tailwind class conflicts (last one wins)', () => {
    it('resolves conflicting Tailwind classes with same base', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('resolves conflicting color classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('resolves conflicting margin classes', () => {
      expect(cn('mt-4', 'mb-4')).toBe('mt-4 mb-4')
    })

    it('resolves conflicting padding classes in different directions', () => {
      expect(cn('pt-2', 'pb-2')).toBe('pt-2 pb-2')
    })

    it('resolves multiple conflicts with last winning', () => {
      expect(cn('text-sm', 'text-lg', 'text-xl')).toBe('text-xl')
    })

    it('resolves conflicting width and height', () => {
      expect(cn('w-10', 'w-20', 'h-10', 'h-20')).toBe('w-20 h-20')
    })

    it('resolves conflicting flex direction classes', () => {
      expect(cn('flex-row', 'flex-col')).toBe('flex-col')
    })
  })

  describe('conditional classes (clsx handles falsey values)', () => {
    it('handles false condition', () => {
      const isActive = false
      expect(cn('base', isActive && 'active')).toBe('base')
    })

    it('handles true condition', () => {
      const isActive = true
      expect(cn('base', isActive && 'active')).toBe('base active')
    })

    it('handles null and undefined', () => {
      expect(cn('base', null, undefined, 'end')).toBe('base end')
    })

    it('handles zero and empty string as falsy', () => {
      expect(cn('base', 0, '', 'end')).toBe('base end')
    })

    it('handles conditional object', () => {
      const isEnabled = true
      const isHighlighted = false
      expect(cn('btn', { 'btn-active': isEnabled, 'btn-highlighted': isHighlighted })).toBe(
        'btn btn-active'
      )
    })
  })

  describe('mix of strings, objects, and arrays', () => {
    it('handles string array input', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('handles nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz')
    })

    it('handles object with string values', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo')
    })

    it('handles mix of strings, objects, and arrays', () => {
      expect(cn('foo', { bar: true, baz: false }, ['qux', 'quux'])).toBe(
        'foo bar qux quux'
      )
    })

    it('handles complex nested structure', () => {
      const isActive = true
      const isDisabled = false
      expect(
        cn(
          'btn',
          ['btn-md', 'btn-primary'],
          { 'btn-active': isActive, 'btn-disabled': isDisabled },
          'btn-end'
        )
      ).toBe('btn btn-md btn-primary btn-active btn-end')
    })

    it('handles array with conditional values', () => {
      const showExtra = true
      expect(cn('base', ['extra', showExtra && 'conditional'])).toBe('base extra conditional')
    })
  })

  describe('real-world Tailwind patterns', () => {
    it('handles button variant pattern', () => {
      const variant = 'primary'
      const sizes = { sm: true, md: false, lg: false }
      expect(cn('btn', `btn-${variant}`, sizes.sm && 'btn-sm')).toBe(
        'btn btn-primary btn-sm'
      )
    })

    it('handles responsive class pattern', () => {
      expect(cn('w-full', 'md:w-1/2', 'lg:w-1/3')).toBe('w-full md:w-1/2 lg:w-1/3')
    })

    it('handles merge of identical classes', () => {
      expect(cn('px-2 px-2', 'py-2')).toBe('px-2 py-2')
    })

    it('handles dynamic class composition', () => {
      const size = 'large'
      const color = 'blue'
      const isRounded = true
      const isDisabled = false

      expect(
        cn(
          'button',
          `button-${size}`,
          `button-${color}`,
          isRounded && 'rounded',
          !isDisabled && 'enabled'
        )
      ).toBe('button button-large button-blue rounded enabled')
    })
  })
})
