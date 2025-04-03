"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  File,
  FileEdit,
  FilePlus,
  Folder,
  FolderPlus,
  LogOut,
  Moon,
  MoreVertical,
  Search,
  Sun,
  Trash2,
  User,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  modified?: string
  children?: FileItem[]
  expanded?: boolean
}

export default function FileManager() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [fileContent, setFileContent] = useState("")
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Documents",
      type: "folder",
      modified: "2023-04-01",
      expanded: true,
      children: [
        {
          id: "2",
          name: "Work",
          type: "folder",
          modified: "2023-04-01",
          children: [
            { id: "3", name: "Report.docx", type: "file", size: "245 KB", modified: "2023-04-01" },
            { id: "4", name: "Presentation.pptx", type: "file", size: "1.2 MB", modified: "2023-03-28" },
          ],
        },
        { id: "5", name: "Resume.pdf", type: "file", size: "420 KB", modified: "2023-02-15" },
        { id: "6", name: "Notes.txt", type: "file", size: "12 KB", modified: "2023-03-20" },
      ],
    },
    {
      id: "7",
      name: "Pictures",
      type: "folder",
      modified: "2023-03-15",
      children: [
        { id: "8", name: "Vacation.jpg", type: "file", size: "3.5 MB", modified: "2023-03-15" },
        { id: "9", name: "Family.jpg", type: "file", size: "2.8 MB", modified: "2023-02-28" },
      ],
    },
    {
      id: "10",
      name: "Projects",
      type: "folder",
      modified: "2023-04-02",
      children: [
        { id: "11", name: "Website", type: "folder", modified: "2023-04-02", children: [] },
        { id: "12", name: "App", type: "folder", modified: "2023-03-25", children: [] },
      ],
    },
  ])

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("isAuthenticated") === "true" || sessionStorage.getItem("isAuthenticated") === "true"

    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    sessionStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  const toggleFolder = (id: string) => {
    const updateFiles = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded }
        }
        if (item.children) {
          return { ...item, children: updateFiles(item.children) }
        }
        return item
      })
    }
    setFiles(updateFiles(files))
  }

  const createNewFile = () => {
    if (!newFileName) return

    const newFile: FileItem = {
      id: Date.now().toString(),
      name: newFileName,
      type: "file",
      size: "0 KB",
      modified: new Date().toISOString().split("T")[0],
    }

    setFiles([...files, newFile])
    setNewFileName("")
    setShowNewFileDialog(false)
  }

  const deleteFile = (id: string) => {
    const removeFile = (items: FileItem[]): FileItem[] => {
      return items.filter((item) => {
        if (item.id === id) {
          return false
        }
        if (item.children) {
          item.children = removeFile(item.children)
        }
        return true
      })
    }
    setFiles(removeFile(files))
    setSelectedFile(null)
  }

  const openFile = (file: FileItem) => {
    setSelectedFile(file)
    setFileContent(`This is the content of ${file.name}`)
    if (file.type === "file") {
      setShowEditDialog(true)
    }
  }

  const saveFile = () => {
    setShowEditDialog(false)
  }

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items
      .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((item) => (
        <div key={item.id} style={{ marginLeft: `${level * 20}px` }}>
          <div
            className={`flex items-center p-2 rounded-md cursor-pointer ${
              selectedFile?.id === item.id ? "bg-primary/10" : "hover:bg-muted"
            }`}
            onClick={() => setSelectedFile(item)}
            onDoubleClick={() => openFile(item)}
          >
            {item.type === "folder" && (
              <button
                className="mr-1 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(item.id)
                }}
              >
                {item.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {item.type === "folder" ? (
              <Folder className="w-5 h-5 mr-2 text-yellow-500" />
            ) : (
              <File className="w-5 h-5 mr-2 text-blue-500" />
            )}
            <span className="flex-1">{item.name}</span>
            <span className="text-xs text-muted-foreground mr-4">{item.size}</span>
            <span className="text-xs text-muted-foreground mr-2">{item.modified}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.type === "file" && (
                  <DropdownMenuItem onClick={() => openFile(item)}>
                    <FileEdit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteFile(item.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {item.type === "folder" && item.expanded && item.children && renderFileTree(item.children, level + 1)}
        </div>
      ))
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">File Manager</h1>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => setShowNewFileDialog(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            New File
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled={!selectedFile}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" disabled={!selectedFile}>
                Move
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedFile}
                onClick={() => selectedFile && deleteFile(selectedFile.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* File browser */}
        <div className="flex-1 p-4 overflow-auto">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {renderFileTree(files)}
            </TabsContent>
            <TabsContent value="recent" className="mt-4">
              <p className="text-muted-foreground">Recent files will appear here.</p>
            </TabsContent>
            <TabsContent value="favorites" className="mt-4">
              <p className="text-muted-foreground">Favorite files will appear here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                File Name
              </label>
              <Input
                id="name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={createNewFile}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit File Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <textarea
              className="min-h-[300px] p-4 border rounded-md"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveFile}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

