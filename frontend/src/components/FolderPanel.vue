<script setup lang="ts">
import { ref, watch, computed } from "vue";
import api from "../api";

interface Folder {
    id: number;
    parent_id: number|null;
    name:string;
}
interface FileItem {
  id: number;
  name: string;
  path: string;
  folder_id: number;
}

const files = ref<FileItem[]>([]);
const props = defineProps<{
    selectedFolder:Folder|null;
}>();
const emit=defineEmits<{
    (e:"folderSelected",folder:Folder):void;
}>();
const subfolders=ref<Folder[]>([]);
const selectedSubId=ref<Number|null>(null);
const currentFolder=ref<Folder|null>(null);
const searchQuery=ref("");
const editingId = ref<number | null>(null);
const editName = ref("");
const selectedFile = ref<File | null>(null);
const showUploadModal = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
watch(
    ()=>props.selectedFolder,
    async (folder)=>{
        selectedSubId.value=null;
        currentFolder.value=folder;
        if(folder){
            const resSub = await api.get<Folder[]>(`/folders/${folder.id}/children`);
            subfolders.value=resSub.data;
            const resFiles = await api.get<FileItem[]>(`/folders/folders/${folder.id}/files`);
            files.value = resFiles.data;
        }else{
            subfolders.value=[];
            files.value = [];
        }
        searchQuery.value="";
    },
    {immediate:true}
);
function handleSubClick(sub: Folder){
    selectedSubId.value=sub.id;
}
async function handleSubDblClick(sub: Folder){
    selectedSubId.value=sub.id;
    currentFolder.value=sub;
    emit("folderSelected",sub);
    const res=await api.get<Folder[]>(`/folders/${sub.id}/children`);
    subfolders.value=res.data;
    searchQuery.value="";
}
const filteredSubFolders=computed(()=>{
    if(!searchQuery.value.trim()) return subfolders.value;
    return subfolders.value.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});
async function createNewFolder() {
  if (!currentFolder.value) {
    alert("Pilih folder dulu di panel kiri.");
    return;
  }
  const name = prompt("Nama folder baru:");
  if (!name) return;

  try {
    const res = await api.post("/folders/folders", {
      name,
      parent_id: currentFolder.value.id,
    });
    subfolders.value.push(res.data); // langsung update list
  } catch (err) {
    alert("Gagal membuat folder");
  }
}
function startRename(sub: Folder) {
  editingId.value = sub.id;
  editName.value = sub.name;
}
function cancelRename() {
  editingId.value = null;
  editName.value = "";
}
async function confirmRename(sub: Folder) {
  if (!editName.value.trim()) return;

  try {
    const res = await api.put(`/folders/folders/${sub.id}`, { name: editName.value });
    subfolders.value = subfolders.value.map(f =>
      f.id === sub.id ? { ...f, name: res.data.name } : f
    );
    cancelRename();
  } catch (err) {
    console.error(err);
    alert("Gagal mengganti nama folder");
  }
}
async function handleDelete(id: number) {
  if (!confirm("Yakin ingin menghapus folder ini?")) return;

  try {
    await api.delete(`/folders/folders/${id}`);
    subfolders.value = subfolders.value.filter(sub => sub.id !== id);
  } catch (err) {
    console.error(err);
    alert("Gagal menghapus folder");
  }
}
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
}

async function uploadFile() {
    if (!selectedFile.value || !currentFolder.value) {
        alert("Pilih file dan folder dulu");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    try {
        await api.post(`/folders/folders/${currentFolder.value.id}/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        });
        const resFiles = await api.get<FileItem[]>(`/folders/folders/${currentFolder.value.id}/files`);
        files.value = resFiles.data;
        alert("File berhasil diupload");
        resetFileInput();
        selectedFile.value = null;
    } catch (err) {
        console.error(err);
        alert("Gagal upload file");
    }
}
function resetFileInput() {
    selectedFile.value = null;
    if (fileInputRef.value) {
        fileInputRef.value.value = "";
    }
}
</script>
<template>
    <div>
        <h2 v-if="currentFolder">
            Subfolders of {{ currentFolder?.name }}
        </h2>
        
        <div class="row">
            <div class="col-8">
                <table>
                    <tr>
                        <td>
                            
                        </td>
                        <td>
                            <div class="upload-box">
                                <input ref="fileInputRef" type="file" @change="handleFileChange" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <button class="btn btn-primary py-0 px-2" @click="createNewFolder"><span class="fa fa-plus"></span> New folder</button>
                        </td>
                        <td><button @click="uploadFile">Upload</button></td>
                    </tr>
                </table>
            </div>
            <div class="col-3">
                <input type="text" v-model="searchQuery" placeholder="Search subfolders..." class="search-box"/>
            </div>
        </div>
        
        <ul>
            <ol 
                v-for="sub in filteredSubFolders" 
                :key="sub.id"
                class="subfolder-item"
                :class="{selected:selectedSubId===sub.id}"
                @click="handleSubClick(sub)"
                @dblclick="handleSubDblClick(sub)"
            >
                <table>
                    <tr>
                        <td>
                            <table>
                                <tr>
                                    <td>
                                        <a class="text-warning" @click.stop="startRename(sub)"><span class="fa fa-edit"></span></a>
                                    </td>
                                    <td>
                                        <a class="text-danger" @click.stop="handleDelete(sub.id)"><span class="fa fa-times"></span></a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td>
                            | 📁 <span v-if="editingId !== sub.id">{{ sub.name }}</span>
                            <input 
                                v-else 
                                v-model="editName" 
                                @keyup.enter="confirmRename(sub)" 
                                @blur="cancelRename" 
                                class="rename-input"
                            />&nbsp;
                        </td>
                    </tr>
                    
                </table>
            </ol>
            <ul v-for="file in files" :key="file.id">
                <div class="row">
                    <div class="col" style="padding-left:37px">
                        |  📄 {{ file.name }}
                    </div>
                </div>
            </ul>
        </ul>
        <p v-if="!currentFolder">👈 Klik folder di kiri untuk melihat subfolder</p>
    </div>
</template>
<style scoped>
.search-box{
    width:95%;
    padding:6px 10px;
    margin:6px 0;
    border:1px solid #ccc;
    border-radius:4px;
}
.subfolder-item{
    padding: 6px 10px;
    border-radius: 4px;
    cursor:pointer;
}
.subfolder-item:hover{
    background-color:rgb(211,231,231);
}
.subfolder-item.selected{
    background-color:rgb(211,231,231);
}
.upload-box {
  margin: 10px 0;
}
.upload-box input {
  margin-right: 8px;
}
</style>