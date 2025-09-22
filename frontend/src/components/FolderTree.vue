<script setup lang="ts">
import { ref, onMounted } from "vue";
import FolderNode from "./FolderNode.vue";
import api from "../api";

interface Folder {
  id: number;
  parent_id: number | null;
  name: string;
  children?: Folder[];
}

const folders = ref<Folder[]>([]);
const selectedId = ref<number | null>(null);
const props=defineProps<{
    selectedFolder:Folder|null;
}>();
const emit = defineEmits<{
  (e: "folderSelected", folder: Folder): void;
}>();

function buildTree(list: Folder[], parentId: number | null = null): Folder[] {
  return list
    .filter(f => f.parent_id === parentId)
    .map(f => ({ ...f, children: buildTree(list, f.id) }));
}

async function loadFolders() {
  const res = await api.get<Folder[]>("/folders");
  folders.value = buildTree(res.data);
}

function handleSelect(folder: Folder) {
  selectedId.value = folder.id;
  emit("folderSelected", folder);
}

onMounted(loadFolders);
</script>

<template>
  <div>
    <FolderNode
      v-for="folder in folders"
      :key="folder.id"
      :folder="folder"
      :selectedId="props.selectedFolder?.id??null"
      :onSelect="handleSelect"
    />
  </div>
</template>
