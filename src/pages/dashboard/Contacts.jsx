import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Mail, Phone, User, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import toast from 'react-hot-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/ui/dialog'

export default function Contacts() {
    const { user } = useAuth()
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form states
    const [editingContact, setEditingContact] = useState(null)
    const [contactName, setContactName] = useState('')
    const [contactGmail, setContactGmail] = useState('')
    const [contactNumber, setContactNumber] = useState('')

    // Delete state
    const [contactToDelete, setContactToDelete] = useState(null)

    useEffect(() => {
        if (user) {
            fetchContacts()
        }
    }, [user])

    const fetchContacts = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('user_contact')
                .select('*')
                .eq('user_id', user.id)
                .order('contact_name')

            if (error) throw error
            setContacts(data || [])
        } catch (error) {
            console.error('Error fetching contacts:', error)
            toast.error('Gagal memuat daftar kontak')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (contact = null) => {
        if (contact) {
            setEditingContact(contact)
            setContactName(contact.contact_name || '')
            setContactGmail(contact.contact_gmail || '')
            setContactNumber(contact.contact_number || '')
        } else {
            setEditingContact(null)
            setContactName('')
            setContactGmail('')
            setContactNumber('')
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setTimeout(() => {
            setEditingContact(null)
            setContactName('')
            setContactGmail('')
            setContactNumber('')
        }, 200)
    }

    const validateForm = () => {
        if (!contactName.trim()) {
            toast.error('Nama kontak tidak boleh kosong')
            return false
        }
        if (!contactGmail.trim() && !contactNumber.trim()) {
            toast.error('Kontak harus memiliki setidaknya Gmail atau WhatsApp')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const contactData = {
                user_id: user.id,
                contact_name: contactName,
                contact_gmail: contactGmail,
                contact_number: contactNumber
            }

            if (editingContact) {
                // Determine how to update (if user_id is the only PK in supabase, we might update by user_id and old contact_name)
                // Assuming it has an 'id' or we can update based on name
                let query = supabase.from('user_contact').update(contactData).eq('user_id', user.id)

                // If there's a unique id column returned by supabase, use it. Otherwise rely on old contact_name
                if (editingContact.id) {
                    query = query.eq('id', editingContact.id)
                } else if (editingContact.contact_gmail) {
                    query = query.eq('contact_gmail', editingContact.contact_gmail)
                } else {
                    query = query.eq('contact_name', editingContact.contact_name)
                }

                const { error } = await query
                if (error) throw error
                toast.success('Kontak berhasil diperbarui')
            } else {
                // Create
                const { error } = await supabase
                    .from('user_contact')
                    .insert([contactData])

                if (error) {
                    // Assuming duplicate key means they can only have one if user_id is true PK
                    if (error.code === '23505') {
                        throw new Error('Anda sudah memiliki kontak. Gunakan tombol Edit untuk mengubah kontak Anda.')
                    }
                    throw error
                }
                toast.success('Kontak berhasil ditambahkan')
            }

            handleCloseDialog()
            fetchContacts()
        } catch (error) {
            console.error('Error saving contact:', error)
            toast.error(error.message || 'Gagal menyimpan kontak')
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = (contact) => {
        setContactToDelete(contact)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!contactToDelete) return

        setIsSubmitting(true)
        try {
            let query = supabase.from('user_contact').delete().eq('user_id', user.id)

            if (contactToDelete.id) {
                query = query.eq('id', contactToDelete.id)
            } else if (contactToDelete.contact_gmail) {
                query = query.eq('contact_gmail', contactToDelete.contact_gmail)
            } else {
                query = query.eq('contact_name', contactToDelete.contact_name)
            }

            const { error } = await query

            if (error) throw error
            toast.success('Kontak berhasil dihapus')
            fetchContacts()
        } catch (error) {
            console.error('Error deleting contact:', error)
            toast.error('Gagal menghapus kontak')
        } finally {
            setIsSubmitting(false)
            setIsDeleteDialogOpen(false)
            setContactToDelete(null)
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Contacts</h1>
                    <p className="text-gray-400">Kelola informasi kontak Gmail beserta WhatsApp Anda</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Kontak
                </Button>
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : contacts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card flex flex-col items-center justify-center py-24 text-center px-4"
                >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Phone className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Belum ada kontak</h3>
                    <p className="text-gray-400 max-w-sm mx-auto mb-6">
                        Anda belum menambahkan informasi kontak apapun. Tambahkan kontak pertama Anda sekarang.
                    </p>
                    <Button onClick={() => handleOpenDialog()} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kontak
                    </Button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contacts.map((contact, index) => (
                        <motion.div
                            key={contact.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="glass-card p-6 flex flex-col h-full hover:border-white/20 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{contact.contact_name}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenDialog(contact)}
                                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors bg-white/5 hover:bg-white/10 rounded-lg"
                                        title="Edit Kontak"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(contact)}
                                        className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 rounded-lg"
                                        title="Hapus Kontak"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mt-auto">
                                {contact.contact_gmail && (
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="truncate">{contact.contact_gmail}</span>
                                    </div>
                                )}
                                {contact.contact_number && (
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="truncate">{contact.contact_number}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingContact ? 'Edit Kontak' : 'Tambah Kontak Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactName">Nama Kontak</Label>
                            <Input
                                id="contactName"
                                placeholder="Masukkan nama kontak"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactGmail">Gmail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    id="contactGmail"
                                    type="email"
                                    placeholder="contoh@gmail.com"
                                    className="pl-10"
                                    value={contactGmail}
                                    onChange={(e) => setContactGmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactNumber">WhatsApp / Nomor Telepon</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    id="contactNumber"
                                    type="tel"
                                    placeholder="+62 8..."
                                    className="pl-10"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCloseDialog}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Kontak'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                            Konfirmasi Hapus
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-300">
                            Apakah Anda yakin ingin menghapus kontak <strong className="text-white">{contactToDelete?.contact_name}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
