import { RoundInfo } from './components/RoundInfo'

export default function RoundInfoPage() {
  return <RoundInfo />
}



// 'use client'
// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { Search, Plus, Eye } from 'lucide-react'
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// // Mock data for groups
// const mockGroups = [
//   { id: 1, number: 'Group 1', participants: 5, status: 'Reviewed' },
//   { id: 2, number: 'Group 2', participants: 4, status: 'Qualified' },
//   { id: 3, number: 'Group 3', participants: 6, status: 'Rejected' },
//   { id: 4, number: 'Group 4', participants: 5, status: 'Reviewed' },
//   { id: 5, number: 'Group 5', participants: 4, status: 'Qualified' },
// ]

// export default function RoundInfo() {
//   const [searchTerm, setSearchTerm] = useState('')
// //   const [reviewStatus, setReviewStatus] = useState(false)
//   const [groups, setGroups] = useState(mockGroups)

//   const filteredGroups = groups.filter(group =>
//     group.number.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const statusCounts = groups.reduce((acc, group) => {
//     acc[group.status] = (acc[group.status] || 0) + 1
//     return acc
//   }, {} as Record<string, number>)

//   const handleCreateGroup = () => {
//     const newGroup = {
//       id: groups.length + 1,
//       number: `Group ${groups.length + 1}`,
//       participants: 0,
//       status: 'Pending'
//     }
//     setGroups([...groups, newGroup])
//   }

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 to-black p-8">
//       <motion.div
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="container mx-auto"
//       >
//         <header className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-white mb-2">GD Round</h1>
//           <p className="text-xl text-blue-300">Current Round Information</p>
//         </header>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           {['Rejected', 'Reviewed', 'Qualified'].map((status) => (
//             <Card key={status} className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
//               <CardHeader>
//                 <CardTitle className="text-2xl font-semibold text-white">{status}</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-4xl font-bold text-blue-400">{statusCounts[status] || 0}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 mb-8">
//           <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
//             <div className="relative w-full md:w-64">
//               <Input
//                 type="text"
//                 placeholder="Search groups..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 bg-transparent text-white border-blue-500 focus:border-blue-400"
//               />
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2">
//                 {/* <input
//                   type="checkbox"
//                   id="reviewStatus"
//                   checked={reviewStatus}
//                   onChange={(e) => setReviewStatus(e.target.checked)}
//                   className="h-4 w-4 rounded border-blue-500 text-blue-600 focus:ring-blue-500"
//                 /> */}
//                 <label htmlFor="reviewStatus" className="text-white">Review Status</label>
//               </div>
//               <Button onClick={handleCreateGroup} className="bg-blue-600 hover:bg-blue-700">
//                 <Plus className="mr-2 h-4 w-4" /> Create New Group
//               </Button>
//             </div>
//           </div>

//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="text-blue-300">Group No.</TableHead>
//                 <TableHead className="text-blue-300">Participants</TableHead>
//                 <TableHead className="text-blue-300">Status</TableHead>
//                 <TableHead className="text-blue-300">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredGroups.map((group) => (
//                 <TableRow key={group.id} className="border-b border-blue-800">
//                   <TableCell className="font-medium text-white">{group.number}</TableCell>
//                   <TableCell className="text-white">{group.participants}</TableCell>
//                   <TableCell>
//                     <Badge
//                       className={`${
//                         group.status === 'Qualified' ? 'bg-green-500' :
//                         group.status === 'Reviewed' ? 'bg-yellow-500' :
//                         'bg-red-500'
//                       } text-white`}
//                     >
//                       {group.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <Button variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
//                       <Eye className="mr-2 h-4 w-4" /> View Info
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </motion.div>
//     </div>
//   )
// }
