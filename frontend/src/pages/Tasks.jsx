import React, { useState, useEffect } freact';
import { motion, AnimatePresence } fromon';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon
  CheckIcon,
  PencilIcon,
rashIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon
ne';
import { useAuth } fr
impor
import taskS';
import LoadingSpinner from '../components/comm

const Tasks = () => {
  const { user } = useAuth();
  const { showSuccess, showEn();
  const [tasks, setTasks] = useState([]);
  cons);
  con);
  const [seate('');
  const [filterStatus, setFilterStat
  const [filterPriority, setFilterPriority] = useState('all');
  const [showTaskModal, sse);
  const [editingTask,
  const [submitting, setSubm

  // Tm state
  cone({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    tags: []
  });
  const [tagInput, setTagInput] = useState(

  us

  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
     ing(true);
    id);
]);
    } catch (error) {
      console.error('error);
      showError('Failed to load tasks. Please try again.');
      // Use mock data as fallback
      setTasks([
        {
     
    ',
e',
          'high',
          status: 'in-progress',
          dueDate: '
          tags: ['documentation', 'project'],
          cre)
        },
        {
          id: 2,
          title: 'Review pull requests',
          description: 'Review and approve pending pull
          prioium',
          stat
          dueDate: '2024-01-18',
          tags: ['],
          createdg()
        },
   {
          id: 3,
          title: 'Update dependencies',
          description: 'Update all project depends',
          priority: 'low
          status: 'completed',
          dueDate: '2024-01-15',
          tags: [''],
          createdAt: new ()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask
    setEditingTask(null);
    setTaskForm({
      title: '',
      descript: '',
')[0],
      priority: 'medium',
      tags: []
    });
    setTagInput('');
    setShowTaskModal(ue);
  };

  const han=> {
    setEditingTak(task);
    setTaskForm({
      title: task '',
      description: task.description || '',
      dueDate: task.d
      priority: task.priority || 'medium',
      tags: task.tags || []
    });
    setTagInput('');
    setShowTaskModae);
  };

 {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      showError('Task;
      return;
    }

    setSubmitting(true);
    
    try {
      const taskData = {
        ...taskForm,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        dueDate: new Date(taskFo
      };

      if (editingTask) {
        await taskService
        showSuccess('Task updated successfully!');
        setTasks(prev => prev.mapsk => 
          task.id === edik
        ));
      } else {
        const response = await taskS
        showSuccess(ly!');
        setTasks(prev => [response.data, ...prev]);
      }
      
      setShowTaskModal(fae);
      setEditingTask(null);
    } catch (error) {
      console.error('Failedror);
      showError('Failed to save t');
    } finally {
      setSubmitting(fal
    }
  };

  const handleDeleteTask> {
    if (!confirm('Are rn;
    
    try {
      await taskService);
      showS');
      setTas));
) {
      console.error('Failor);
      showError('Failed to delete 
    }
  };

  const handleToggleComplete = async (t
    try {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await taskService.updateTaskStatus(task.id, newStatus);
      showSucces`);
      setTasks(prev => prev.map(t => 
        t.id === task.id ? : t
      ));
    } catch (error) {
      console.error('Failed to update task status:',ror);
      showErro.');
    }
  };

  const handleAddTag 
    consim();
    if (ta{
    > ({
  ,

      }));   setTagInasks; Taultexport def;
};

>
  )    </divresence>
 </AnimateP  )}
     v>
      .dion   </moti     .div>
    </motion        m>
   </for          div>
       </           button>
          </            )}
              Task'
    eateask' : 'Cr'Update Tsk ?    editingTa                     ) : (
                  </>
                   </span>
   ting...'}.' : 'Crea.. 'Updatingask ?{editingT"ml-2">Name=span class <                />
       " allsmer size="oadingSpinn      <L             <>
                        ? (
    tting    {submi       >
                       ng}
    mittiub{sisabled=       d            y-50"
 itd:opacors disableion-col00 transit-primary-7hover:bgnded-lg dium rout-meite fon-wh0 textimary-604 py-2 bg-pr-center px--flex itemsineame="inl      classN              "
"submit      type=         
       <button              utton>
    </b              
  el     Canc        >
                  
       ing}ittbmisabled={su          d  
        lors"n-co0 transitiondary-70coover:bg-sery-50 dark:hda:bg-secon-lg hoveroundeddary-300 r-secon00 dark:texty-7xt-secondartecondary-600 :border-se300 darkcondary--se border py-2 borderme="px-4sNaas         cl           false)}
dal(tShowTaskMo) => se{(ck=     onCli               "
ype="button     t          
       <button                y-700">
econdarrder-s00 dark:bosecondary-2border-r-t bordet-4  p gap-3stify-end"flex ju className=    <div    
        Actions */}  {/*            div>

          </      v>
   di        </         >
 /button       <            
   Add                    >
           "
         lorsn-coansitiotrry-600 -seconda:bg dark:hover-200g-secondaryover:bounded-lg h00 rary-3ondxt-secte dark:y-700econdar0 text-sndary-70rk:bg-secoy-100 dabg-secondar2 x-4 py-e="pam     classN        
         AddTag}ick={handle     onCl            
     ton"but  type="                
    utton  <b            
           />            "
   s...Add taglder="     placeho                -100"
 ndary:text-secoy-900 darkarext-secondondary-700 tecte dark:bg-sy-500 bg-whirimar:ring-pfocus2 :ring-cusfoutline-none focus:od-lg unde600 ro-secondary-orderdark:bdary-300 r-seconorder borde-2 b1 px-3 pyame="flex-classN                    
  agKeyPress}dleTess={hanonKeyPr                
      rget.value)}e.tasetTagInput(> ge={(e) =   onChan                  
 agInput}lue={t      va            ext"
        type="t           
           <input            -2">
    gape="flex ssNam    <div cla             /div>
        <
           }         ))      span>
        </                 ton>
         </but         
            ×                 
       >                     
 -800"rimaryext-p00 hover:ty-6ext-primarame="ml-2 tlassN       c          
         Tag(tag)}vedleRemo> han) =nClick={(         o                utton"
 type="b                         utton
         <b               {tag}
                 
           >             
      ull"ded-froun-sm ry-300 text:text-primaark00 dxt-primary-700/20 teg-primary-9dark:bimary-100 1 bg-prpx-3 py-er x items-cente-fleme="inlinclassNa                      
  ={tag}     key                    <span
                   => (
  p((tag) Form.tags.ma    {task           ">
     -2 mb-2gapp  flex-wraflexName="ssdiv cla  <          l>
      /labe <       
                Tags              
2">ary-300 mb-ond-sec:textrk00 dacondary-7dium text-se-mext-sm font tee="blocklassNam<label c              iv>
        <d            
{/* Tags */}            v>

      </di                 </div>
         ect>
      /sel         <       ption>
    igh</ogh">Hlue="hiption va     <o              ption>
   ium</oedium">Med="malueoption v    <              tion>
    opw">Low</lolue="on vaopti      <             >
               
        ndary-100"-secotext900 dark:-secondary--700 textecondaryte dark:bg-sbg-whiry-500 s:ring-primang-2 focus:rie foculine-nons:outnded-lg focuary-600 rourder-second300 dark:bodary-der-seconororder b px-3 py-2 b"w-fullme=sNa    clas              }
    })).value .targety: ev, priorit..pre({ .v => m(prekFor setTasange={(e) =>      onCh             ority}
   taskForm.pri   value={              elect
          <s         
         </label>       
           *  Priority                
    00 mb-2">secondary-3ark:text-700 decondary-m text-snt-mediuext-sm foblock tlassName="label c     <              
 div>     <   
          iv>
   </d            />
                 ed
          requir                 
 ondary-100"-sec0 dark:textary-90t-second00 texsecondary-7k:bg-te darhi-w0 bgary-50-primocus:ringcus:ring-2 fe-none focus:outlinfoded-lg ry-600 roundaeconark:border-s00 dry-3daorder-secon b-2 borderll px-3 pyfume="w-    classNa                  }))}
 arget.valueDate: e.tdue.prev, rev => ({ ..kForm(pe) => setTas={(geonChan           
           e}Form.dueDatue={task val                  date"
   "ype=        t              <input
                    abel>
</l                  ate *
  e D Du                
     0 mb-2">-30condaryk:text-se00 darecondary-7 text-siummed font-ck text-smloName="bl class     <labe       >
        div     <             ">
p-4-cols-2 ga1 sm:gridd grid-cols-Name="gridiv class <           }
     Priority */ and/* Due Date   {            
 
     </div>                 />
              rows={3}
                  n..."
ioripter task desc"Entr=decehol        pla          
  -100"t-secondary dark:tex-900condary700 text-sendary-ark:bg-seco bg-white drimary-500us:ring-pfocring-2 -none focus:s:outlinended-lg focuy-600 rou-secondarrk:border-300 daondary-secr borderrde py-2 bo-full px-3sName="w   clas                e }))}
 valun: e.target.ptiocri, des({ ...prev(prev => etTaskForm => snChange={(e)         o        on}
   tirm.descripskFota={     value          a
        <textare            /label>
     <            on
    riptisc          De         
 00 mb-2">ry-3daeconext-sdark:tdary-700 ont-secdium tex-mext-sm fontlock teme="bl classNa  <labe            
    div>       <       /}
  escription *      {/* D
             </div>
            
         />
          ired      requ         "
     le...er task titolder="Entlaceh       p           "
  ndary-100text-secoy-900 dark:condar-700 text-se-secondarye dark:bgbg-whitprimary-500 ocus:ring-:ring-2 fone focuss:outline-nnded-lg focury-600 rouer-secondaark:bord0 ddary-30econrder-sorder boy-2 bull px-3 psName="w-f        clas            }))}
 valuee.target.v, title: => ({ ...preev rm(praskFo> setTge={(e) =an    onCh           }
     leitaskForm.tvalue={t               "
     t type="tex                     <input
              >
  abel      </l             *
 Title                   0 mb-2">
30condary-t-setexrk:dadary-700  text-seconont-mediumt-sm f="block texel className     <lab          iv>
      <d           */}
   tle  {/* Ti           6">
   6 space-y-assName="p-Task} clandleSubmitt={hnSubmirm o    <fo     

     >/div      <       h2>
         </  '}
      New Taske at : 'Cre'Edit Task'k ?  {editingTas                0">
 ary-10secondext-900 dark:tecondary-ld text-s font-semibotext-xlame="h2 classN    <          -700">
  ndaryrder-seco dark:boary-200rder-secondborder-b bome="p-6 ssNa cla        <div  >
          "
      toy-aurflow-ovex-h-[90vh] ull mal w-f-w-2xow-2xl maxd-xl shadnde0 rouy-80secondarrk:bg- dahite"bg-w  className=            }}
 0.9, y: 20  scale:ity: 0,{ opac={      exit         0 }}
le: 1, y:1, scapacity: { oe={animat    
          9, y: 20 }}: 0.aleity: 0, scal={{ opacti    ini    div
      motion.    <        >
   "
        p-4stify-centerms-center ju ite50 flexblur-sm z- backdrop-/50g-black0 bet-d inssName="fixeclas            0 }}
city: it={{ opa         ex}
   city: 1 }{ opamate={        ani    ty: 0 }}
 opacil={{     initia  div
      <motion.      & (
   dal & {showTaskMo     ence>
  es <AnimatePr */}
     * Task Modal

      {/    )}
  tion.div>    </motton>
          </bu Task
      Create        >
  mr-2" /"w-4 h-4 className=sIcon <Plu           >
 
          lors"nsition-co0 tramary-70:bg-prierhoved-lg ium roundfont-medhite xt-wimary-600 teprbg--2 -4 pyms-center pxe-flex ite"inlin className=         Task}
  handleCreateick={    onCl
        on   <butt       >
    </p               }

   rst task.' fieating yourrted by crGet sta        : '
      for.'e looking t you\'rhars to find wilte or four search ying'Try adjust  ?       
       = 'all'ty !=ioriterPrall' || filus !== '| filterStaterm |{searchT          mb-6">
  ndary-400 ecodark:text-s600 t-secondary-"texp className=        <</h3>
         
   s found'}: 'No taskilters'  your f tasks match 'Noll' ? !== 'aterPriority fil' ||s !== 'allatuterSt|| filsearchTerm      {     mb-2">
  -100 rydatext-secon-900 dark:xt-secondarydium teont-me fme="text-lgh3 classNa        <   </div>
  />
       -400" ondaryxt-secw-8 h-8 teclassName="n ulletIcoListB     <>
       uto mb-4" mx-aerify-cententer justex items-cll fl-fued roundondary-800:bg-secy-100 darkbg-secondar6 h-16 e="w-1 classNam   <div
           >y-12"
    center pme="text-assNa cl     }}
     opacity: 1 ={{mateni          a 0 }}
city:itial={{ opa in         div
   <motion.    && (
   !loadingth === 0 &&s.lengilteredTask {f  
   y State */}   {/* Empt

     </div>}
        ))
    n.div>io      </mot</div>
               
 iv>     </d
         /button>         <
        />4"4 h-e="w-classNamhIcon ras     <T           
         >     
    "lorstion-co transiunded-lg rored-900/20rk:hover:bg-red-50 da00 hover:bg-t-red-6:texer00 hovcondary-6ext-se2 te="p-lassNam        c      
    id)}eTask(task.handleDelet => nClick={()       o      n
         <butto            tton>
bu    </            -4" />
"w-4 hName=assilIcon cl   <Penc             >
              ors"
    colansition-ounded-lg tr/20 rary-900over:bg-primk:hary-50 dar:bg-prim-600 hoverimaryer:text-pr-600 hovondary-2 text-seclassName="p    c        
      ask(task)}leEditT=> handick={()   onCl          ton
      <but               ">
 gap-2center flex items-Name="ssv cla      <di    
    ns */} Actio{/*    
          >
  </div      iv>
               </d         </div>
             )}
                           </div>
                
     </div>                    )}
           )            pan>
    </s                       }
      {tag                             >
                            ded"
 rouncondary-400xt-se600 dark:tet-secondary-700 texsecondary-ark:bg--100 darycondt-xs bg-seexy-1 t-2 p"px=ame     classN                        {tag}
      key=                      an
   sp    <                     > (
   p((tag) =k.tags.ma  {tas                
        ">flex gap-1ame=" <div classN                      />
  4""w-4 h-=n className  <TagIco                      gap-2">
r ems-centeme="flex itassNacl <div                      (
  0 &&gth >lentags.gs && task.sk.tata       {                
             )}
                    
      </div>           
         ing()}ateStreDoLocal.tk.dueDate)te(tas{new Daue:   D               
       /> h-4 mr-1" ssName="w-4rIcon claalenda<C              
          er">tems-centx isName="fle   <div clas                 && (
   eDate  {task.du           
       -400">econdarytext-sdark:500 condary-text-se4 text-sm p-er gax items-centme="fleassNa cl   <div                    
                 )}
            </p>
                    ption}
  escri{task.d                     mb-3">
 00 dary-4t-secon0 dark:texy-60ndar"text-secoe=assNam   <p cl         
        tion && (ask.descrip    {t            
           
               </div>          
  </span>                    ' ')}
'-', ace(replus.at {task.st              >
       us)}`}attask.stlor(etStatusCo ${gnded-fulledium rous font-m text-x-1`px-2 pyName={an class         <sp
            </span>          
         ty}sk.priori{ta                      `}>
rity)}riotask.plor(orityCoetPriull ${gd-fedium roundeont-m-xs f1 text py-Name={`px-2pan class       <s           </h3>
                 tle}
        {task.ti               
          }`}>              '
100t-secondary-k:tex darry-900datext-secon        : '            
    e-through' -500 lint-secondarytex '    ?                  ' 
   'completed ===k.status       tas              bold ${
 ont-semig f-lsName={`text  <h3 clas                  -3 mb-2">
-center gapemsx ite="flelassNam<div c                >
  e="flex-1"sNam  <div clas         t */}
     ask Conten    {/* T          utton>

        </b   >}
        h-3" /"w-3assName=heckIcon cl& <Cmpleted' &us === 'co{task.stat                 >
                    }`}
              
 r-green-500'deover:bor-600 hondaryorder-secark:bry-300 d-seconda : 'border                te'
     t-whiexeen-500 ter-gr bord-green-500bg '           ?         
  ted'mpleatus === 'cosk.st         ta        rs ${
   colon-ansitio tr-centerify-center justx itemsrder-2 fle5 rounded bo1 w-5 h-sName={`mt-   clas            
   te(task)}ompleeToggleC=> handl{()  onClick=                 tton
       <bu
         ox */}* Checkb  {/       >
       -1"ex4 flgap-rt tax items-sme="flelassNa c  <div            >
etween"t justify-b items-starflex="ssName  <div cla              >
      "
hadowsition-sw-xl tranado hover:sh-700secondaryk:border- dar200ondary-order-secg border bshadow-ll p-6 nded-xroudary-800 ark:bg-seconite d-wh="bglassName       c.1 }}
     dex * 0delay: intion={{ si tran          
 y: 0 }}opacity: 1, {  animate={         
  0 }}ty: 0, y: 2l={{ opaci      initia.id}
      y={task  ke  
        tion.div   <mo
       ) => ((task, indexdTasks.map( {filtere
       ace-y-4">="spsNameas   <div cl*/}
   asks List   {/* T   </div>

    div>
           </n>
  </butto        />
 "w-4 h-4"n className=umnsIco<ViewCol         >
                }`}
  
       0'-80condaryver:bg-se:hory-100 darkr:bg-secondahove600 econdary-text-s    : '        0' 
    mary-40t-priex0/20 dark:try-90rimabg-pry-600 dark:ext-prima00 ty-1? 'bg-primar              
  '  === 'board       view
       rs ${ion-colo transit2 rounded-lgame={`p-classN           oard')}
 ew('bViset{() => ick=   onCl        on
  <butt        /button>
       <    -4" />
="w-4 hclassNamen tIco<ListBulle       
           >         }`}
       y-800'
g-secondardark:hover:bary-100 ondhover:bg-secy-600 condar 'text-se     :    
        imary-400'text-pr900/20 dark:primary-k:bg--600 darxt-primaryry-100 te-prima    ? 'bg            t' 
iew === 'lis         v
     rs ${tion-coloansiunded-lg tr rossName={`p-2      cla
      st')}tView('li{() => se   onClick=            <button
    >
   gap-2"ms-center "flex itelassName= cdiv    <*/}
    le iew Togg/* V

        {   </div>    
  </select>
         ion>ptow</oue="low">Lon valti  <op         
 </option>m">Mediumdiuue="meoption val  <        ption>
  h">High</oue="hig val   <option
         ion>ity</opt Prior>Alle="all"<option valu              >
      
  -100"rysecondaext-900 dark:t-secondary-textcondary-700 see dark:bg- bg-whitmary-500g-pricus:rin2 fo:ring-one focustline-nocus:ounded-lg f600 rouy-arecond:border-sary-300 darker-second bord2 border"px-3 py-e=classNam           alue)}
 et.v(e.targlterPriority => setFi{(e)hange=  onC
          terPriority}  value={fil
          <select         

 select>          </>
optionmpleted</eted">Coompllue="cn vaoptio           <option>
 n Progress</>Igress"pron-n value="iptio        <o
    </option>o Doe="todo">Tion valuopt       <n>
     tio/opus< StatAll"all"> value=    <option       >
     00"
      -1secondaryxt-tery-900 dark:text-seconday-700 g-secondarhite dark:bry-500 bg-wma:ring-priing-2 focusnone focus:re-focus:outlinnded-lg  rouary-600order-secondrk:bdary-300 daborder-seconder -3 py-2 borpxssName="       cla    )}
 ue.valargetus(e.trStat setFilte={(e) =>   onChange    s}
     taturS{filteue=         valelect
    <s         }
 */ilters       {/* Fiv>

           </d  
         />  00"
 y-1dartext-seconry-900 dark:-seconda00 textecondary-7te dark:bg-sy-500 bg-whider-primar00 focus:borry-5g-prima-2 focus:rining focus:rnoneine-cus:outlnded-lg fo0 rouondary-60border-secdark:ndary-300 coer border-se4 py-2 bordl-10 pr-64 pull sm:w-ame="w-fssN  cla            alue)}
m(e.target.vearchTer => setSe)nge={(ha    onC        
  rchTerm}ea={salue   v   "
        ...earch tasksholder="S    place        
  "text" type=             t
pu     <in    />
    ondary-400"4 text-sec w-4 h-slate-y-1/2form -tran1/2 trans top-ute left-3absolassName="lassIcon clgGinMagnify          <-none">
  1 sm:flexx-ative fleelsName="rdiv clas       <
   */}earch       {/* So">
    l sm:w-autw-fuler gap-4 x items-cent"fle className=   <div     ap-4">
n geejustify-betw-center ems-start sm:itex-row itemssm:flx-col ex flessName="fl  <div cla*/}
    lbar    {/* Too  >

     </div/button>
  
        <New Task
          -4 mr-2" />"w-4 he=on classNamusIc  <Pl    
            >"
adow-xler:shw-lg hovshadocolors n-ioransitry-700 tprimaver:bg-horounded-lg medium hite font-00 text-wg-primary-6-2 bpy px-4 er-centtemsine-flex iName="inlass        clteTask}
  handleCreak={      onClicbutton
        <>
        </div
    </p>         y.
 entlfficiasks enize your te and orga     Manag    00">
   ry-4xt-seconda dark:teondary-600="text-sec className         <p   </h1>
        sks
       Ta0">
     dary-10:text-secony-900 darkext-secondarbold t2xl font-"text-e=ssNam<h1 cla          >
       <div>
 "fy-betweenenter justitems-c"flex iame=sN  <div clas*/}
    /* Header   {">
    y-6space-e="sNamclas   <div  return (
 ;
  }

 >
    )      </divge" />
ze="larinner sidingSp      <Loa  -64">
-center hstifynter jus-ce"flex iteme=div classNam <
     n (ur    ret{
ading) if (lo

    });sPriority;
tches && matchesStatu maearch &&urn matchesS   
    ret
 rPriority;ty === filte task.prioriall' ||ity === 'erPrioriltity = fortchesPri  const ma;
  tusStailtertus === f| task.sta= 'all' |atus ==ilterStsStatus = fnst matche   co
 Case());LowerTerm.tos(searchse().includen?.toLowerCariptio task.desc                        se()) ||
oLowerCasearchTerm.ts(cluderCase().inwe.title.toLoh = tasktchesSearc   const matask => {
 asks.filter(dTasks = tlteret fi;

  cons}
  }
    800';-secondary-rk:bgary-100 da-secondary-600 bg-second'textturn t: re    defaul800';
  secondary-00 dark:bg--1dary0 bg-seconary-60text-second return ''todo':ase     ce-300';
  -bluextark:t0 d900/2e- dark:bg-blu100g-blue- be-700rn 'text-blugress': retucase 'in-pro  
    reen-300';ark:text-g900/20 d-green-rk:bg0 da10n-700 bg-greereen--g'textreturn ed': e 'complet
      casus) {stath (witc=> {
    sstatus) Color = (etStatus g
  const };
    }
 ry-800';
g-seconda00 dark:bcondary-100 bg-sery-6ext-secondareturn 't  default: 0';
    -30-greendark:textreen-900/20 :bg-gen-100 darkreeen-700 bg-gt-grurn 'tex'low': retcase       low-300';
:text-yelrk900/20 daellow-k:bg-y darellow-100low-700 bg-yeln 'text-yium': reture 'med cas
     red-300';xt-dark:teed-900/20 :bg-rarkg-red-100 dred-700 b 'text-gh': return    case 'hi
  riority) {  switch (p
  ity) => { = (priororolrityCPrionst get  co
  };

ag();
    }eAddTndl);
      hault(.preventDefa   e  
 === ',') {key  || e. 'Enter'ey ===if (e.k  e) => {
  ess = (KeyPrt handleTag

  cons }));
  };  
 tagToRemove)= tag !=(tag => ags.filtertags: prev.trev,
      
      ...p({v => orm(pre    setTaskF => {
move) (tagToReeTag =eRemov handlnst };

  co    }
 );
(''utp
   