<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, FolderOpened } from '@element-plus/icons-vue'
import type { PlatformCategoryListResponseData } from '../types/electron'

const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const categoryFormRef = ref()
const categories = ref<PlatformCategoryListResponseData[]>([])

const categoryForm = ref({
  category_id: 0,
  code: '',
  name: '',
  description: ''
})

const categoryRules = {
  code: [
    { required: true, message: '请输入分类代码', trigger: 'blur' },
    { min: 2, max: 20, message: '分类代码长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分类名称长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

const loadCategories = async () => {
  loading.value = true
  try {
    const result = await window.electronAPI.platformCategoryList({ sort_order: 'asc' })
    if (result.success) {
      categories.value = result.data || []
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('加载分类列表失败')
    console.error('加载分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = async () => {
  if (!categoryFormRef.value) return
  const valid = await categoryFormRef.value.validate()
  if (valid) {
    loading.value = true
    try {
      const data = {
        code: categoryForm.value.code,
        name: categoryForm.value.name,
        description: categoryForm.value.description
      }
      const result = await window.electronAPI.platformCategoryCreate(data)
      if (result.success) {
        ElMessage.success('创建分类成功')
        showAddDialog.value = false
        resetForm()
        loadCategories()
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('创建分类失败')
      console.error('创建分类失败:', error)
    } finally {
      loading.value = false
    }
  }
}

const handleEdit = (row: any) => {
  categoryForm.value = {
    category_id: row.category_id,
    code: row.code,
    name: row.name,
    description: row.description
  }
  showEditDialog.value = true
}

const handleUpdate = async () => {
  if (!categoryFormRef.value) return
  const valid = await categoryFormRef.value.validate()
  if (valid) {
    loading.value = true
    try {
      const data = {
        category_id: categoryForm.value.category_id,
        code: categoryForm.value.code,
        name: categoryForm.value.name,
        description: categoryForm.value.description
      }
      const result = await window.electronAPI.platformCategoryUpdate(data)
      if (result.success) {
        ElMessage.success('修改分类成功')
        showEditDialog.value = false
        resetForm()
        loadCategories()
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('修改分类失败')
      console.error('修改分类失败:', error)
    } finally {
      loading.value = false
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    const result = await window.electronAPI.platformCategoryDelete({ category_id: row.category_id })
    if (result.success) {
      ElMessage.success('删除分类成功')
      loadCategories()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除分类失败')
      console.error('删除分类失败:', error)
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  categoryForm.value = {
    category_id: 0,
    code: '',
    name: '',
    description: ''
  }
}

const cancel = () => {
  showAddDialog.value = false
  showEditDialog.value = false
  resetForm()
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="category-container">
    <el-card class="category-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <div class="header-icon">
              <el-icon :size="24"><FolderOpened /></el-icon>
            </div>
            <h2>平台分类管理</h2>
          </div>
          <el-button type="primary" @click="showAddDialog = true" size="large">
            <el-icon><Plus /></el-icon>
            <span>创建分类</span>
          </el-button>
        </div>
      </template>

      <el-table :data="categories" style="width: 100%" v-loading="loading" class="category-table">
        <el-table-column prop="code" label="分类代码" width="120" />
        <el-table-column prop="name" label="分类名称" width="150" />
        <el-table-column prop="description" label="分类描述" />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="操作" width="200" fixed="right" class-name="operation-column">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)" class="table-btn">
              <el-icon><Edit /></el-icon>
              <span>修改</span>
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)" class="table-btn">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAddDialog" title="创建分类" width="500px" @close="cancel">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="100px">
        <el-form-item label="分类代码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类代码" autocomplete="off" />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" autocomplete="off" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" placeholder="请输入分类描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="loading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="修改分类" width="500px" @close="cancel">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="100px">
        <el-form-item label="分类代码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类代码" autocomplete="off" />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" autocomplete="off" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" placeholder="请输入分类描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-container {
  padding: 20px;
}

.category-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-md);
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.category-table) {
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.category-table .el-table__header-wrapper) {
  background: var(--bg-tertiary);
}

:deep(.category-table .el-table__header th) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
  padding: 16px 12px;
}

:deep(.category-table .el-table__body tr:hover > td) {
  background: var(--bg-secondary) !important;
}

:deep(.category-table .el-table__body td) {
  color: var(--text-secondary);
  padding: 16px 12px;
}

:deep(.category-table .operation-column) {
  background: var(--bg-primary);
}

:deep(.category-table .operation-column .cell) {
  padding: 0;
}

.table-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s;
  margin-right: 8px;
}

.table-btn:last-child {
  margin-right: 0;
}

.table-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
