 "use client";                                                                                                                   
                                                                                                                                   
   import { usePathname } from "next/navigation";                                                                                  
   import { Link } from "@/i18n/navigation";          
   
   

   type Link = {
     href: string;
     label: string;
   };
                                                                                                                                   
   export function HeaderNavLinks({ links }:{links: Link[]}) {                                                                                     
     const pathname = usePathname();                                                                                               
                                                                                                                                   
     return (                                                                                                                      
       <>                                                                                                                          
         {links.map((link) => (                                                                                                    
           <Link                                                                                                                   
             key={link.href}                                                                                                       
             href={link.href}                                                                                                      
             className={`text-sm font-medium transition-colors hover:text-foreground ${                                            
               pathname === link.href                                                                                              
                 ? " underline text-brand-gold"                                                                                     
                 : "text-muted-foreground"                                                                                         
             }`}                                                                                                                   
           >                                                                                                                       
             {link.label}                                                                                                          
           </Link>                                                                                                                 
         ))}                                                                                                                       
       </>                                                                                                                         
     );                                                                                                                            
   }                    