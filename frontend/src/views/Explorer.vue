<script setup lang="ts">
import {ref} from "vue";
import FolderTree from "../components/FolderTree.vue";
import FolderPanel from "../components/FolderPanel.vue";
interface Folder{
    id:number;
    parent_id:number|null;
    name:string;
    children?:Folder[];
}
const selectedFolder = ref<Folder | null>(null);
function updateSelected(folder: Folder){
    selectedFolder.value=folder;
}
</script>
<template>
    <div class="explorer-container">
        <div class="panel-left">
            <FolderTree :selectedFolder="selectedFolder" @folderSelected="updateSelected"/>
        </div>
        <div class="panel-right">
            <FolderPanel :selectedFolder="selectedFolder" @folderSelected="updateSelected"/>
        </div>
    </div>
</template>
<style>
.explorer-container{
    display:flex;
    height:100vh;
}
.panel-left{
    width:360px;
    border-right:1px solid #e5e7eb;
    overflow-y:auto;
    padding:10px;
    background:#f9fafb;
}
.panel-right{
    flex:1;
    padding:10px;
    overflow-y:auto;
    background:#ffffff;
}
</style>