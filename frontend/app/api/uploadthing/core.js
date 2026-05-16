import { createUploadthing } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(() => {
      return {}
    })
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl || file.url }
    }),

  cardAttachment: f({
    image: { maxFileSize: '8MB', maxFileCount: 4 },
    pdf: { maxFileSize: '16MB', maxFileCount: 2 },
  })
    .middleware(() => {
      return {}
    })
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl || file.url }
    }),
}
