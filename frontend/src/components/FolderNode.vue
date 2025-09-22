<script setup lang="ts">
import { ref } from "vue";
interface Folder{
    id:number;
    parent_id:number|null;
    name:string;
    children?:Folder[];
}
const props=defineProps<{
    folder:Folder;
    onSelect:(folder:Folder)=> void;
    selectedId: number|null;
    level?:number;

}>();
const level =props.level??0;
const isExpanded=ref(false);
function toggleExpand(){
    isExpanded.value=!isExpanded.value;
}
function handleClick(folder:Folder){
    props.onSelect(folder);
}
</script>
<template>
    <div :style="{paddingLeft:level*10+'px'}">
        <div
            class="folder-item" :class="{selected:props.selectedId===folder.id}"  @click.stop="handleClick(folder)" @dblclick.stop="toggleExpand"
        >
            <span @click.stop="toggleExpand" class="toggle-icon">
                {{ isExpanded ? "▼" : "▶" }}
            </span>
            <span class="space">
                {{ folder.name }}
            </span>
        </div>
        <div v-if="isExpanded && folder.children">
            <FolderNode
                v-for="child in folder.children"
                :key="child.id"
                :folder="child"
                :onSelect="onSelect"
                :selectedId="props.selectedId"
                :level="level+1"
            />
        </div>
    </div>
</template>
<style>
.folder-item {
  padding: 5px;
}
.folder-item:hover{
    background-color: rgb(211, 231, 231);
    cursor: pointer;
}
.folder-item.selected{
    background-color: rgb(211, 231, 231);
}
.space{
    padding: 5px;
}
.toggle-icon {
  cursor: pointer;
  color: black;
}

.toggle-icon:hover {
  color: rgb(255, 153, 0);
}
</style>