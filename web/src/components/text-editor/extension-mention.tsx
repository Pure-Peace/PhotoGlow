'use client'

import Mention from '@tiptap/extension-mention'
import { Editor, ReactRenderer, Extension } from '@tiptap/react'
import tippy from 'tippy.js'
import type {
  GetReferenceClientRect,
  Instance as PopupInstance,
} from 'tippy.js'
import { PluginKey } from '@tiptap/pm/state'
import {
  SuggestionItem,
  SuggestionList,
  SuggestionListProps,
  SuggestionListRef,
} from './plugin-suggestion'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'

export type MentionExtensionProps = {
  query: string
  editor: Editor
}

export type MentionExtensionOptions = {
  key: string
  triggerChar: string
  fetchSuggestions: (props: MentionExtensionProps) => Promise<SuggestionItem[]>
}

export function defineMentionExtension({
  key,
  triggerChar,
  fetchSuggestions,
}: MentionExtensionOptions) {
  const mentionKey = `mention-${key}`

  return Mention.extend({
    name: mentionKey,
  }).configure({
    deleteTriggerWithBackspace: false,
    // mention item style display in editor
    HTMLAttributes: {
      class: 'text-blue-500 break-words',
    },
    // suggestion plugin
    suggestion: {
      pluginKey: new PluginKey(mentionKey),
      char: triggerChar,
      allowedPrefixes: null,
      // fetch suggestions from backend or something
      items: fetchSuggestions,
      // render suggestion list
      render: () => {
        let component: ReactRenderer<SuggestionListRef, SuggestionListProps>
        let popup: PopupInstance[] // the mention suggestion list

        return {
          onStart: ({ editor, clientRect, ...props }) => {
            if (!clientRect) {
              return
            }

            // suggestion list component
            component = new ReactRenderer(SuggestionList, {
              props: { ...props, mentionType: key }, // !!custom args here
              editor,
            })

            // the suggestion list will be shown on the input element
            popup = tippy('body', {
              getReferenceClientRect: clientRect as GetReferenceClientRect, // set the popup position to the input element
              appendTo: 'parent', // the popup in parent element
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            })
          },

          onUpdate({ clientRect, ...props }) {
            component.updateProps(props)

            if (!clientRect) {
              return
            }

            // when input any text, should update the popup position
            popup[0].setProps({
              getReferenceClientRect: clientRect as GetReferenceClientRect,
            })
          },

          // handle the keydown event
          onKeyDown(props) {
            if (props.event.key === 'Escape') {
              popup[0].hide()
              return true
            }

            // the handler defined in the suggestion list component
            return component.ref?.onKeyDown(props) ?? false
          },

          // when close the popup, should destroy the popup and the suggestion list
          onExit() {
            popup[0]?.destroy()
            component.destroy()
          },
        }
      },
    },
  })
}

export const MentionUserExtension = defineMentionExtension({
  key: 'user',
  triggerChar: '@',
  fetchSuggestions: async ({ query }) => {
    const { accessToken } = useAuthStore.getState()
    const users = await api.searchMentionUsers(
      query,
      accessToken ?? undefined
    )
    return users.map((user) => ({
      key: user.key,
      id: user.id,
      label: user.displayName,
      avatar: user.avatar || undefined,
    }))
  },
}) as Extension

export const MentionTopicExtension = defineMentionExtension({
  key: 'topic',
  triggerChar: '#',
  fetchSuggestions: async ({ query }) => {
    const topics = await api.searchMentionTopics(query)
    return topics.map((topic) => ({
      key: topic.key,
      id: topic.id,
      label: topic.key,
    }))
  },
}) as Extension
