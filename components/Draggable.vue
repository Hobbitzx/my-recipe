<template>
  <div>
    <Container
      orientation="vertical"
      :drag-handle-selector="handle"
      lock-axis="y"
      @drop="onDrop"
      :drag-begin-delay="180"
    >
      <Draggable 
        v-for="(item, i) in items" 
        :key="getItemId(item, i)"
      >
        <slot :item="item" :index="i"></slot>
      </Draggable>
    </Container>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { Container, Draggable } from "vue3-smooth-dnd";

interface Props {
  items: any[];
  handle?: string | null;
}

interface SlotProps {
  item: any;
  index: number;
}

const props = withDefaults(defineProps<Props>(), {
  handle: null
});

defineSlots<{
  default(props: SlotProps): any;
}>();

const emit = defineEmits<{
  'update:items': [items: any[]]
}>();

const getItemId = (item: any, index: number) => {
  return item?.id ?? item?.key ?? index;
};

const releaseTouchScroll = () => {
  if (typeof document === 'undefined') return;
  document.body.classList.remove('smooth-dnd-disable-touch-action');
};

const onDrop = (dropResult: any) => {
  const newItems = applyDrag(props.items, dropResult);
  emit('update:items', newItems);
  releaseTouchScroll();
};

const applyDrag = (arr: any[], dragResult: any) => {
  const { removedIndex, addedIndex, payload } = dragResult;

  if (removedIndex === null && addedIndex === null) return arr;
  const result = [...arr];
  let itemToAdd = payload;
  
  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }
  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }
  return result;
};

onBeforeUnmount(() => {
  releaseTouchScroll();
});
</script>